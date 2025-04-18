#include "io.h"
#include "sim.h"

#ifndef EMBEDDED
#include <stdarg.h>
#include <stdio.h>
#include <string.h>

// Behaves the same as printf
int io_printf(const char* format, ...) {
    va_list args;
    va_start(args, format);
    int ret = vprintf(format, args);
    va_end(args);
    return ret;
}

// Returns 0 on success, -1 on error
int io_readline(char* buf, int n) {
    char* ret = fgets(buf, n, stdin);
    if (ret == NULL) {
        return -1; // Error or EOF
    } else {
        return 0;
    }
}

// Returns current step, NULL if invalid
char* io_currentstep(char* line) {
    char* token = strtok(line, " ");
    while (token) {
        token = strtok(NULL, " ");
        if (strcmp(token, SIM_ADDVEHICLE) == 0) {
            return token;
        } else if (strcmp(token, SIM_STEP) == 0) {
            return token;
        }
    }

    return NULL;
}

#endif

#ifdef EMBEDDED
int io_printf(const char* format, ...) {
    // USART
}

int io_readline(char* buf, int n) {
    // USART
}

int io_currentstep(char* line) {
    // TODO
}
#endif
