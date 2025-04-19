#ifndef SIM_H
#define SIM_H

#include "queue.h"

#define CMD_ADDVEHICLE "ADD_VEHICLE"
#define CMD_STEP "STEP"

typedef enum { GREEN, YELLOW, RED } LightState;
typedef enum { NORTH_SOUTH, EAST_WEST } Direction;

typedef struct SimState {
    Direction current_direction;
    LightState light_state; // Light state on current_direction
    int timer;
    Queue north, south, east, west;

    // Preferences
    float threshold; // Change red to green when cars_stopped/cars_going >= this number
    int green_min, green_max;
} SimState;

// threshold - prefer direction when cars_stopped/cars_going >= this number
// green_min - min simulation steps after which green light ends
// green_max - max simulation steps after which green light ends
void init_sim(SimState* state, float threshold, int green_min, int green_max);
void delete_sim(SimState* state);

#endif
