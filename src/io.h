#ifndef IO_H
#define IO_H

int io_readinput(int argc, char* argv[]);
int io_printf(const char* format, ...);
int io_readline(char* buf, int n);

#endif
