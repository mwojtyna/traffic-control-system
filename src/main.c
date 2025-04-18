#include "io.h"
#include <string.h>

int main(void) {
    char cmd[256];

    while (io_readline(cmd, sizeof(cmd)) == 0) {
        char* token = strtok(cmd, " ");
        token = strtok(NULL, " ");
        if (strcmp(token, "ADD_VEHICLE") == 0) {

        } else if (strcmp(token, "STEP") == 0) {
        }
    }

    return 0;
}
