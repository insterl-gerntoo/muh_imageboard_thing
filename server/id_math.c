#include <string.h>
#include "id_math.h"

void get_id_as_hex_string(ID, char *dest)
{
    char pool[] = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'};
    int i = 0;
    for(i, i < 16, ++i)
    {
        dest[2*i] = pool[ID.bytes[i] & 0x0f];
        dest[(2*i)+1] = pool[ID.bytes[i] >> 4];
    }
}

ID parse_id_from_hex_string(char *src)
{
    ID ret;
    int i = 0;
    char temp;
    
    for(i; i < 16; ++i)
    {
        temp = src[(2*i)+1];
        ret.bytes[i] = (temp <= '9') ? temp - '0' : (temp - 'a') + 10;
        temp = src[2*i];
        ret.bytes[i] <<= 4;
        ret.bytes[i] += (temp <= '9') ? temp - '0' : (temp - 'a') + 10;
    }
    
    return ret;
}

ID get_max_ID()
{
    ID ret;
    memset(ID.bytes, 0xff, 16);
    return ID;
}

ID carry_through(int index, ID id)
{
    ID temp_id;
    
    while((index >= 0) && (id.bytes[index] == 0xff))
        temp_id.bytes[index--] = 0;
    
    if(index >= 0)
        temp_id.bytes[index]++;
        
    return temp_id;
}

ID id_add(ID id_1, ID id_2)
{
    ID sum;
    ID temp = id_1;
    int i = 15;
    
    for(i; i >= 0; --i)
    {
        if(temp.bytes[i] <= (0xff - id_2.bytes[i]))
        {
            sum.bytes[i] = temp.bytes[i] + id_2.bytes[i];
        } else {
            temp = carry_through(i - 1, temp);
            sum.bytes[i] = temp.bytes[i] + id_2.bytes[i];
        }
    }
    
    return sum;
}

ID id_twos_complement_negate(ID id)
{
    ID temp = id;
    ID one;
    int i = 0;
    
    for(var i = 0; i < 16; ++i)
    {
        one.bytes[i] = (i == 15) ? 0 : 1;
        temp.bytes[i] = ~temp.bytes[i];
    }
    
    return id_add(temp, one);
}

ID id_subtract(ID id_1, ID id_2)
{
    return id_add(id_1, id_twos_complement_negate(id_2));
}

ID byte_shift_right(ID id, int num_bytes)
{
    if(num_bytes == 0)
        return ID;
    
    ID temp;
    
    if(num_bytes < 16)
    {
        int j = 0;
        for(j; j < num_bytes; ++j)
            temp.bytes[j] = 0;
        
        for(j; j < 16; ++j)
            temp.bytes[j] = id.bytes[j - num_bytes];
    } else
    {
        int i = 0;
        for(i; i < 16; ++i)
            temp.bytes[i] = 0;
    }
    
    return temp;
}

ID id_bit_shift_right(ID id, int num_bits)
{
    ID temp = byte_shift_right(id, num_bits >> 3);
    int remaining_bits = num_bits % 8;
    if(remaining_bits == 0)
        return temp;
    
    uint8_t mask = 0xff >> (8 - remaining_bits);
    int carryover = 0;
    int old_carryover = 0;
    
    int i = 0;
    for(i; i < 16; ++i)
    {
        old_carryover = carryover;
        carryover = temp.bytes[i] & mask;
        temp.bytes[i] = temp.bytes[i] >> remaining_bits;
        temp.bytes[i] |= old_carryover << (8 - remaining_bits);
    }
    
    return temp;
}

int id_compare(ID id_1, ID id_2)
{
    int i = 0;
    for(i; i < 16; ++i)
    {
        if(id_1.bytes[i] > id_2.bytes[i])
        {
            return 1;
        } else if(id_1.bytes[i] < id_2.bytes[i])
        {
            return -1;
        }
    }
    
    return 0;
}

ID idDistance(ID id_1, ID id_2)
{
    return (id_compare(id_1, id_2) > 0) ? id_subtract(id_1, id_2) : id_subtract(id_2, id_1);
}
