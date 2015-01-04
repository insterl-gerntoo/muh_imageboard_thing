//TODO: Put in the minimal amount of effort it would require to have arbitrary-sized ID's

//I've decided to use a Uint8Array for ID's; it makes math easier
function getID()
{
    var ret = new Uint8Array(16);
    
    for(var i = 0; i < 16; ++i)
        ret[i] = Math.floor(Math.random() * 255);
    
    return ret;
}

function getIdAsHexString(id)
{
    var ret = "";
    for(var i = 0; i < 16; ++i)
        ret += ("0" + id[i].toString(16)).slice(-2);
    
    return ret;
}

function parseIdFromHexString(id_string)
{
    temp_id = new Uint8Array(16);
    
    for(var i = 0; i < 16; ++i)
        temp_id[i] = parseInt(id_string.slice(2*i, 2*(i+1)), 16);
    
    return temp_id;
}

function getMaxId()
{
    var max_id = new Uint8Array(16);
    
    for(var i = 0; i < 16; ++i)
        max_id[i] = 0xff;
    
    return max_id;
}

function addResultsInCarry(int_1, int_2)
{
    return int_2 > (0xff - int_1);
}

function carryThrough(index, id)
{
    var temp_id = new Uint8Array(id);
    
    while((index >= 0) && (id[index] == 0xff))
        temp_id[index--] = 0;
    
    if(index >= 0)
        temp_id[index]++;
        
    return temp_id;
}

function id_add(id_1, id_2)
{
    var sum = new Uint8Array(16);
    var temp1 = new Uint8Array(id_1);
    for(var i = 15; i >= 0; --i)
    {
        if(!addResultsInCarry(temp1[i], id_2[i]))
        {
            sum[i] = temp1[i] + id_2[i];
        } else {
            temp1 = carryThrough(i - 1, temp1);
            sum[i] = (temp1[i] + id_2[i]) & 0x00ff;
        }
    }
    
    return sum;
}

function byte_shift_right(id, num_bytes)
{
    if(num_bytes == 0)
        return new Uint8Array(id);
    
    var temp = new Uint8Array(id.length);
    
    if(num_bytes < 16)
    {
        var j = 0;
        for(j; j < num_bytes; ++j)
            temp[j] = 0;
        
        for(j; j < 16; ++j)
            temp[j] = id[j - num_bytes];
    } else
    {
        for(var i = 0; i < 16; ++i)
            temp[i] = 0;
    }
    
    return temp;
}

function id_bit_shift_right(id, num_bits)
{
    var temp = byte_shift_right(id, num_bits >> 3);
    var remaining_bits = num_bits % 8;
    if(remaining_bits == 0)
        return temp;
    
    var mask = 0xff >> (8 - remaining_bits);
    var carryover = 0;
    var old_carryover = 0;
    
    for(var i = 0; i < 16; ++i)
    {
        old_carryover = carryover;
        carryover = temp[i] & mask;
        temp[i] = temp[i] >> remaining_bits;
        temp[i] = temp[i] | (old_carryover << (8 - remaining_bits));
    }
    
    return temp;
}

function id_compare(id_1, id_2)
{
    for(var i = 0; i < 16; ++i)
    {
        if(id_1[i] > id_2[i])
        {
            return 1;
        } else if(id_1[i] < id_2[i])
        {
            return -1;
        }
    }
    
    return 0;
}
