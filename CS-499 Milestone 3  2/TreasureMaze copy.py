# This class represents the environment, which includes a maze object defined as a matrix. 

import numpy as np

visited_mark = 0.8  # The visited cells are marked by an 80% gray shade.
pirate_mark = 0.5   # The current cell where the pirate is located is marked by a 50% gray shade.

# The agent can move in one of four directions.
LEFT = 0
UP = 1
RIGHT = 2
DOWN = 3


class TreasureMaze(object):
    """
    Environment class for the pirate agent.
    Handles movement, rewards, valid actions, and visualization.
    """

    def __init__(self, maze, pirate=(0, 0)):
        self._maze = np.array(maze)
        nrows, ncols = self._maze.shape

        # Target cell (treasure)
        self.target = (nrows - 1, ncols - 1)

        # All navigable cells
        self.free_cells = [
            (r, c) for r in range(nrows)
            for c in range(ncols)
            if self._maze[r, c] == 1.0
        ]

        # Target must be navigable
        if self._maze[self.target] == 0.0:
            raise Exception("Invalid maze: target cell cannot be blocked!")

        # Remove target from free_cells list
        if self.target in self.free_cells:
            self.free_cells.remove(self.target)

        # Pirate must start in a free cell
        if pirate not in self.free_cells:
            raise Exception("Invalid Pirate Location: must sit on a free cell")

        # Reset environment
        self.reset(pirate)

    # ---------------------------------------------------------------
    # Reset the environment
    # ---------------------------------------------------------------
    def reset(self, pirate):
        self.pirate = pirate
        self.maze = np.copy(self._maze)
        row, col = pirate

        # Mark pirate cell
        self.maze[row, col] = pirate_mark

        # State = (row, col, mode)
        self.state = (row, col, "start")

        # Minimum reward prevents infinite loops
        self.min_reward = -0.5 * self.maze.size
        self.total_reward = 0
        self.visited = set()

    # ---------------------------------------------------------------
    # Update position based on action
    # ---------------------------------------------------------------
    def update_state(self, action):
        pirate_row, pirate_col, mode = self.state
        nrows, ncols = self.maze.shape

        # Mark visited
        if self.maze[pirate_row, pirate_col] > 0.0:
            self.visited.add((pirate_row, pirate_col))

        valid_actions = self.valid_actions()

        # Default: invalid
        nmode = "invalid"
        nrow, ncol = pirate_row, pirate_col

        if not valid_actions:
            nmode = "blocked"

        elif action in valid_actions:
            nmode = "valid"

            if action == LEFT:
                ncol -= 1
            elif action == RIGHT:
                ncol += 1
            elif action == UP:
                nrow -= 1
            elif action == DOWN:
                nrow += 1

        # Update state
        self.state = (nrow, ncol, nmode)

    # ---------------------------------------------------------------
    # Reward function
    # ---------------------------------------------------------------
    def get_reward(self):
        pirate_row, pirate_col, mode = self.state
        nrows, ncols = self.maze.shape

        # Reached treasure
        if (pirate_row, pirate_col) == (nrows - 1, ncols - 1):
            return 1.0

        # Blocked / dead-end
        if mode == "blocked":
            return self.min_reward - 1

        # Revisiting cells = penalty
        if (pirate_row, pirate_col) in self.visited:
            return -0.25

        # Invalid action = heavier penalty
        if mode == "invalid":
            return -0.75

        # Regular move penalty (reduces wandering)
        if mode == "valid":
            return -0.04

        return -0.04

    # ---------------------------------------------------------------
    # Take an action → return next state, reward, status
    # ---------------------------------------------------------------
    def act(self, action):
        self.update_state(action)
        reward = self.get_reward()
        self.total_reward += reward
        status = self.game_status()
        envstate = self.observe()
        return envstate, reward, status

    # ---------------------------------------------------------------
    # Return environment state
    # ---------------------------------------------------------------
    def observe(self):
        canvas = self.draw_env()
        envstate = canvas.reshape((1, -1))
        return envstate

    # ---------------------------------------------------------------
    # Visualize maze
    # ---------------------------------------------------------------
    def draw_env(self):
        canvas = np.copy(self.maze)
        nrows, ncols = self.maze.shape

        # Clear marks
        for r in range(nrows):
            for c in range(ncols):
                if canvas[r, c] > 0.0:
                    canvas[r, c] = 1.0

        # Draw pirate
        row, col, _ = self.state
        canvas[row, col] = pirate_mark

        return canvas

    # ---------------------------------------------------------------
    # Game status
    # ---------------------------------------------------------------
    def game_status(self):
        if self.total_reward < self.min_reward:
            return "lose"

        pirate_row, pirate_col, _ = self.state
        nrows, ncols = self.maze.shape

        if (pirate_row, pirate_col) == (nrows - 1, ncols - 1):
            return "win"

        return "not_over"

    # ---------------------------------------------------------------
    # Valid actions
    # ---------------------------------------------------------------
    def valid_actions(self, cell=None):
        if cell is None:
            row, col, _ = self.state
        else:
            row, col = cell

        actions = [LEFT, UP, RIGHT, DOWN]
        nrows, ncols = self.maze.shape

        # Wall constraints
        if row == 0:
            actions.remove(UP)
        if row == nrows - 1:
            actions.remove(DOWN)
        if col == 0:
            actions.remove(LEFT)
        if col == ncols - 1:
            actions.remove(RIGHT)

        # Blocked cells
        if row > 0 and self.maze[row - 1, col] == 0.0:
            if UP in actions:
                actions.remove(UP)
        if row < nrows - 1 and self.maze[row + 1, col] == 0.0:
            if DOWN in actions:
                actions.remove(DOWN)
        if col > 0 and self.maze[row, col - 1] == 0.0:
            if LEFT in actions:
                actions.remove(LEFT)
        if col < ncols - 1 and self.maze[row, col + 1] == 0.0:
            if RIGHT in actions:
                actions.remove(RIGHT)

        return actions

