#ifndef DHT_HEADER
#define DHT_HEADER

#include <websock/websock.h>
#include "id_math.h"

#define IDEAL_BUCKET_POWER_OF_TWO 6
#define NUM_IDEAL_BUCKETS (1 << IDEAL_BUCKET_POWER_OF_TWO)

typedef struct {
    ID id;
    libwebsock_client_state *client;
} Bucket;

typedef struct {
    ID ideal;
    Bucket *buckets;
    unsigned int numbuckets;
    unsigned int capacity;
} IdealBucket;

typedef struct {
    IdealBucket ideal_buckets[NUM_IDEAL_BUCKETS];
} BucketList;

#endif
