from pymongo import MongoClient, ASCENDING
from pymongo.errors import PyMongoError
import os
import logging


class AnimalShelter(object):
    """CRUD operations for Animal collection in MongoDB."""

    def __init__(
        self,
        username=None,
        password=None,
        host=None,
        port=None,
        db_name=None,
        collection_name=None,
    ):
        """Initialize the MongoDB client and target collection.

        Credentials and connection details are read from environment variables
        when not provided explicitly. This supports more secure configuration
        management for deployment.
        """

        # Configure basic logger for this module
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

        # Read configuration from environment variables with safe defaults
        self.host = host or os.getenv("MONGO_HOST", "nv-desktop-services.apporto.com")
        self.port = port or int(os.getenv("MONGO_PORT", 32172))
        self.db_name = db_name or os.getenv("MONGO_DB_NAME", "AAC")
        self.collection_name = collection_name or os.getenv(
            "MONGO_COLLECTION_NAME", "animals"
        )
        self.username = username or os.getenv("MONGO_USERNAME")
        self.password = password or os.getenv("MONGO_PASSWORD")

        try:
            if self.username and self.password:
                uri = (
                    f"mongodb://{self.username}:{self.password}"
                    f"@{self.host}:{self.port}/{self.db_name}?authSource=admin"
                )
            else:
                # Fallback for local/unauthenticated connections
                uri = f"mongodb://{self.host}:{self.port}/{self.db_name}"

            self.client = MongoClient(uri)
            self.database = self.client[self.db_name]
            self.collection = self.database[self.collection_name]

            # Create indexes on frequently queried fields (id, type, breed)
            self.collection.create_index(
                [("animal_id", ASCENDING)], name="idx_animal_id", unique=True
            )
            self.collection.create_index(
                [("animal_type", ASCENDING)], name="idx_animal_type"
            )
            self.collection.create_index(
                [("breed", ASCENDING)], name="idx_breed"
            )

            self.logger.info("MongoDB connection established and indexes ensured.")
        except PyMongoError as e:
            self.logger.error(f"Error connecting to MongoDB: {e}")
            # In case of failure, set collection to None so methods can handle it
            self.collection = None

    def _ensure_connection(self):
        """Internal helper to verify that the collection is available."""
        if self.collection is None:
            raise RuntimeError(
                "No active MongoDB connection. "
                "Check configuration and connectivity."
            )

    # CREATE: Insert a new document into the collection
    def create(self, data):
        """Insert a single document into the animals collection.

        Returns True on success, False on failure.
        """
        if not data:
            raise ValueError("Nothing to save, data is empty")

        try:
            self._ensure_connection()
            self.collection.insert_one(data)
            self.logger.info("Document inserted successfully.")
            return True
        except (PyMongoError, RuntimeError) as e:
            self.logger.error(f"Insert failed: {e}")
            return False

    # READ: Query documents from the collection
    def read(self, query=None):
        """Query documents that match the provided filter.

        If no query is supplied, all documents are returned.
        The MongoDB _id field is excluded to keep consumer UIs clean.
        """
        try:
            self._ensure_connection()
            q = query or {}
            cursor = self.collection.find(q, {"_id": False})
            results = list(cursor)
            self.logger.info(f"Read {len(results)} document(s) from the collection.")
            return results
        except (PyMongoError, RuntimeError) as e:
            self.logger.error(f"Read failed: {e}")
            return []

    # Alias for compatibility with some templates
    def read_all(self, query=None):
        """Convenience wrapper that delegates to read()."""
        return self.read(query)

    # UPDATE: Modify existing documents in the collection
    def update(self, query, new_values):
        """Update all documents matching `query` using the given field values.

        Returns the number of modified documents.
        """
        try:
            self._ensure_connection()
            update_result = self.collection.update_many(
                query, {"$set": new_values}
            )
            self.logger.info(
                f"Updated {update_result.modified_count} document(s)."
            )
            return update_result.modified_count
        except (PyMongoError, RuntimeError) as e:
            self.logger.error(f"Update failed: {e}")
            return 0

    # DELETE: Remove documents from the collection
    def delete(self, query):
        """Delete all documents that match the provided filter.

        Returns the number of deleted documents.
        """
        try:
            self._ensure_connection()
            delete_result = self.collection.delete_many(query)
            self.logger.info(
                f"Deleted {delete_result.deleted_count} document(s)."
            )
            return delete_result.deleted_count
        except (PyMongoError, RuntimeError) as e:
            self.logger.error(f"Delete failed: {e}")
            return 0

    def get_outcome_type_counts(self):
        """Return aggregated counts of animals by outcome_type.

        This uses a MongoDB aggregation pipeline to demonstrate
        server-side analytics capabilities.
        """
        try:
            self._ensure_connection()
            pipeline = [
                {"$group": {"_id": "$outcome_type", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
            ]
            results = list(self.collection.aggregate(pipeline))
            self.logger.info("Aggregation (outcome_type counts) completed.")
            return results
        except (PyMongoError, RuntimeError) as e:
            self.logger.error(f"Aggregation failed: {e}")
            return []
