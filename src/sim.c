#include "sim.h"
#include "queue.h"
#include <stdlib.h>

void init_sim(SimState* state, float threshold, int green_min, int green_max) {
    state->current_direction = NORTH_SOUTH;
    state->light_state = GREEN;
    state->timer = 0;
    state->threshold = threshold;
    state->green_min = green_min;
    state->green_max = green_max;
}

void delete_sim(SimState* state) {
    while (state->north.count > 0) {
        Vehicle* v = dequeue(&state->north);
        free(v);
    }
    while (state->south.count > 0) {
        Vehicle* v = dequeue(&state->south);
        free(v);
    }
    while (state->east.count > 0) {
        Vehicle* v = dequeue(&state->east);
        free(v);
    }
    while (state->west.count > 0) {
        Vehicle* v = dequeue(&state->west);
        free(v);
    }
}
