#include <stdlib.h>

int ideal_bucket_compare(const void *a, const void *b)
{
    return id_compare((*(IdealBucket*)a).ideal, (*(IdealBucket*)b).ideal);
}

void init_DHT(BucketList &bl, ID our_id)
{
    ID temp = our_id;
    ID id_space_fraction = id_bit_shift_right(get_max_ID(), IDEAL_BUCKET_POWER_OF_TWO);
    int i = 0;
    for(i; i < NUM_IDEAL_BUCKETS; ++i)
    {
        bl.ideal_buckets[i].ideal = temp;
        bl.ideal_buckets[i].numbuckets = 0;
        bl.ideal_buckets[i].capacity = 0;
        temp = id_add(temp, id_space_fraction);
    }
    
    qsort(bl.ideal_buckets, NUM_IDEAL_BUCKETS, sizeof(IdealBucket), ideal_bucket_compare);
}

int get_least_distance_ideal_index(BucketList &bl, ID &node_id)
{
    ID lowest = getMaxId();
    int lowest_index = 0;
    int i = 0;
    
    for(i; i < NUM_IDEAL_BUCKETS; ++i)
    {
        if(id_compare(lowest, id_distance(bl.ideal_buckets[i].ideal, node_id)) > 0)
        {
            lowest_index = i;
            lowest = bl.ideal_buckets[i].ideal;
        }
    }
    
    return lowest_index;
}

int bucket_compare(const void *a, const void *b)
{
    return id_compare((*(Bucket*)a).id, (*(Bucket*)b).id);
}

void add_node(BucketList &bl, char* node_id_string, libwebsock_client_state *node_channel)
{
    ID node_id = parse_id_from_hex_string(node_id_string);
    
    int ideal_index = get_least_distance_ideal_index(bl, node_id);
    
    Bucket *temp;
    
    //Really don't want to type that a bunch of times, looks ugly
    Bucket *lessbullshit = &(bl.ideal_buckets[ideal_index]);
    unsigned int newcapacity;
    
    //Make sure we have enough space for a new bucket
    if(lessbullshit->capacity < (lessbullshit->numbuckets + 1))
    {
        newcapacity = (lessbullshit->capacity != 0) ? 2 * lessbullshit->capacity : 1;
        temp = malloc(sizeof(Bucket) * newcapacity);
        memcpy(temp, lessbullshit->buckets, lessbullshit->numbuckets * sizeof(Bucket));
        lessbullshit->capacity = newcapacity;
    }
    
    lessbullshit->buckets[lessbullshit->numbuckets++].id = node_id;
    lessbullshit->buckets[lessbullshit->numbuckets].client = node_channel;
    
    qsort(lessbullshit->buckets, lessbullshit->numbuckets, sizeof(Bucket), bucket_compare);
}

libwebsock_client_state* get_closest_node_channel(BucketList &bl, char *node_id_string)
{
    ID node_id = parse_id_from_hex_string(node_id_string);
    ID lowest = get_max_ID();
    libwebsock_client_state* lowestchannel;
    
    int i = 0;
    int j;
    //TODO: This should really be something like a binary search rather than a linear search, since the buckets are sorted
    for(i; i < NUM_IDEAL_BUCKETS; ++i)
    {
        for(j = 0; j < bl.ideal_buckets[i].numbuckets; ++j)
        {
            if(id_compare(lowest, id_distance(bl.ideal_buckets[i].buckets[j].id, node_id)) > 0)
            {
                lowest = bl.ideal_buckets[i].buckets[j].id;
                lowestchannel = bl.ideal_buckets[i].buckets[j].client;
            }
        }
    }
    
    return lowestchannel;
}
