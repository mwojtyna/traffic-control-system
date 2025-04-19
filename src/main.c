#include "io.h"
#include "queue.h"
#include "sim.h"
#include <string.h>

#define CMD_LEN 256
#define THRESHOLD 0.6
#define GREEN_MIN 5
#define GREEN_MAX 10

int main(void) {
    SimState state;
    init_sim(&state, THRESHOLD, GREEN_MIN, GREEN_MAX);

    char cmd[CMD_LEN];
    while (io_readline(cmd, CMD_LEN) == 0) {
        char* token = strtok(cmd, " ");
        char* tokens[4];

        for (int i = 0; token != NULL; ++i) {
            tokens[i] = token;
            token = strtok(NULL, " ");
        }

        if (strcmp(tokens[0], CMD_ADDVEHICLE) == 0) {
            const char* name = tokens[1];
            const char* start = tokens[2];
            const char* end = tokens[3];

            Queue* queue = NULL;
            if (strcmp(start, "north") == 0) {
                queue = &state.north;
            } else if (strcmp(start, "south") == 0) {
                queue = &state.south;
            } else if (strcmp(start, "east") == 0) {
                queue = &state.east;
            } else if (strcmp(start, "west") == 0) {
                queue = &state.west;
            }
            enqueue(queue, name);
        }
    }

    delete_sim(&state);

    return 0;
}
