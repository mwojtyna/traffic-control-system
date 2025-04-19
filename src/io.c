#include "io.h"

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
        int newline_index = strcspn(buf, "\n");
        buf[newline_index] = '\0'; // Remove newline
        return 0;
    }
}

// Returns a lines of input
int io_readinput(int argc, char** argv) {}

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
