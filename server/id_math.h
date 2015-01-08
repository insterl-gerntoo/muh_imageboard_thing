#ifndef ID_MATH_HEADER
#define ID_MATH_HEADER

#include <stdint.h>

typedef struct {
    uint8_t bytes[16];
} ID;

ID get_id();
void get_id_as_hex_string(ID, char *dest);
ID parse_id_from_hex_string(char *src);
ID get_max_ID();
ID id_add(ID id_1, ID id_2);
ID id_subtract(ID id_1, ID id_2);
ID id_bit_shift_right(ID id, int num_bits);
int id_compare(ID id_1, ID id_2);
int id_comparator(const void *a, const void *b);
ID idDistance(ID id_1, ID id_2);

#endif
