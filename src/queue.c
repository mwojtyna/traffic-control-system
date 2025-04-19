#include "queue.h"

#ifndef EMBEDDED
#include <stdlib.h>
#include <string.h>

void enqueue(Queue* q, const char* name) {
    Vehicle* v = malloc(sizeof(Vehicle));
    v->name = strdup(name);
    v->next = NULL;

    if (q->tail) {
        q->tail->next = v;
    } else {
        q->head = v;
    }
    q->tail = v;

    q->count++;
}

// Free the returned pointer after being done with it
Vehicle* dequeue(Queue* q) {
    if (!q->head) {
        return NULL;
    }

    Vehicle* v = q->head;
    q->head = v->next;

    if (!q->head) {
        q->tail = NULL;
    }
    q->count--;

    return v;
}
#endif

#ifdef EMBEDDED
// Without heap (static array)
#endif
