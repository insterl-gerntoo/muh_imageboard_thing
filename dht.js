var nodes = [];

var buckets = [];

//For now, I'm hard-coding the bucket list size.
//In the future, it should be customizable, but always a power of two
//to make math easier
function initDHT(our_id)
{
    var temp_id = Uint8Array(our_id);
    //First ideal bucket is us, other ideals are based on our ID
   buckets.push({ideal:our_id, nodes:[]});
    
    //Space our ideal ID's apart by 1/32 of the ID space
    var id_space_fraction = id_bit_shift_right(getMaxId(), 5);
    for(var i = 0; i < 31; ++i)
    {
        temp_id = id_add(temp_id, id_space_fraction);
        buckets.push({ideal:temp_id, nodes:[]});
    }
    
    buckets.sort(function(a, b) {return compare(a.ideal, b.ideal);});
}

//Here's what we need to do: create a "distance metric" to each ideal ID
//The nodes then go to the bucket of the ID with the lowest distance metric
//I'm thinking it would be abs(ideal - nodeid)
//Or better, ((ideal > nodeid) ? ideal - nodeid : nodeid - ideal)
//^ better since we're dealing with unsigned integers
