#ifndef IO_H
#define IO_H

int io_printf(const char* format, ...);
int io_readline(char* buf, int n);
char* io_currentstep(char* line);

#endif
