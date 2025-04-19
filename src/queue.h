#ifndef QUEUE_H
#define QUEUE_H

typedef struct Vehicle {
    char* name;
    struct Vehicle* next;
} Vehicle;

typedef struct Queue {
    Vehicle* head;
    Vehicle* tail;
    int count;
} Queue;

void enqueue(Queue* q, const char* name);
Vehicle* dequeue(Queue* q);

#endif
