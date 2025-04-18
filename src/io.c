#include "io.h"

#ifndef EMBEDDED
#include <stdarg.h>
#include <stdio.h>

int io_printf(const char* format, ...) {
    va_list args;
    va_start(args, format);
    int ret = vprintf(format, args);
    va_end(args);
    return ret;
}

int io_readline(char* buf, int n) {
    char* ret = fgets(buf, n, stdin);
    if (ret == NULL) {
        return -1; // Error or EOF
    } else {
        return 0;
    }
}

#endif

#ifdef EMBEDDED
int io_printf(const char* format, ...) {
    // USART
}

int io_readline(char* buf, int n) {
    // USART
}
#endif
