# This class stores the episodes, all the states that come in between the initial state and the terminal state. 
# This is later used by the agent for learning by experience, called "exploration". 

import numpy as np
from collections import deque
from dataclasses import dataclass
from typing import Deque, Tuple


@dataclass
class Episode:
    """
    A single transition in the game:
    (current state, action taken, reward received, next state, game_over flag)
    """
    envstate: np.ndarray
    action: int
    reward: float
    envstate_next: np.ndarray
    game_over: bool


class GameExperience(object):
    """
    Stores recent game episodes and generates training data for a DQN model.
    Uses a fixed-size replay memory to support learning from past experience.
    """
    
    # model = neural network model
    # max_memory = number of episodes to keep in memory. The oldest episode is deleted to make room for a new episode.
    # discount = discount factor; determines the importance of future rewards vs. immediate rewards
    
    def __init__(self, model, max_memory: int = 1000, discount: float = 0.95):
        self.model = model
        self.max_memory = max_memory
        self.discount = discount
        # Use deque so that removing the oldest episode is O(1)
        self.memory: Deque[Episode] = deque(maxlen=max_memory)
        self.num_actions = model.output_shape[-1]

    # Stores episodes in memory
    def remember(self, episode):
        """
        Store a new episode in replay memory.

        Parameters
        ----------
        episode : list or tuple
            [envstate, action, reward, envstate_next, game_over]
        """
        # envstate == flattened 1d maze cells info, including pirate cell (see method: observe)
        envstate, action, reward, envstate_next, game_over = episode
        self.memory.append(
            Episode(envstate=envstate,
                    action=action,
                    reward=reward,
                    envstate_next=envstate_next,
                    game_over=game_over)
        )

    # Predicts the next action based on the current environment state        
    def predict(self, envstate: np.ndarray) -> np.ndarray:
        """
        Run the current model on the given state and return Q-values.
        """
        # Ensure envstate has shape (1, env_size)
        if envstate.ndim == 1:
            envstate = envstate.reshape(1, -1)
        return self.model.predict(envstate)[0]

    # Returns input and targets from memory, defaults to data size of 10
    def get_data(self, data_size: int = 10) -> Tuple[np.ndarray, np.ndarray]:
        """
        Sample a batch of episodes from memory and build
        (inputs, targets) for supervised DQN training.

        Returns
        -------
        inputs : np.ndarray
            Batch of envstates.
        targets : np.ndarray
            Batch of target Q-values for each action.
        """
        if len(self.memory) == 0:
            raise ValueError("Replay memory is empty; call remember() before get_data().")

        # envstate 1d size (1st element of episode)
        env_size = self.memory[0].envstate.shape[1]
        mem_size = len(self.memory)
        data_size = min(mem_size, data_size)

        inputs = np.zeros((data_size, env_size), dtype=np.float32)
        targets = np.zeros((data_size, self.num_actions), dtype=np.float32)

        # Randomly choose indices without replacement
        indices = np.random.choice(range(mem_size), data_size, replace=False)

        for i, idx in enumerate(indices):
            episode = self.memory[idx]
            envstate = episode.envstate
            action = episode.action
            reward = episode.reward
            envstate_next = episode.envstate_next
            game_over = episode.game_over

            inputs[i] = envstate
            # There should be no target values for actions not taken.
            # Start from current Q-values for this state
            q_values = self.predict(envstate)
            targets[i] = q_values

            # Q_sa = derived policy = max quality env/action = max_a' Q(s', a')
            Q_sa = np.max(self.predict(envstate_next))

            if game_over:
                # If terminal, target is just the reward
                targets[i, action] = reward
            else:
                # reward + gamma * max_a' Q(s', a')
                targets[i, action] = reward + self.discount * Q_sa

        return inputs, targets
