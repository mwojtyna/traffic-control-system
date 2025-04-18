#include "io.h"

int main(void) {
    char cmd[256];

    while (io_readline(cmd, sizeof(cmd)) == 0) {
        char* step_type = io_currentstep(cmd);
        if (!step_type) {
            io_printf("Invalid step type");
            continue;
        }
        io_printf(step_type);
    }

    return 0;
}
