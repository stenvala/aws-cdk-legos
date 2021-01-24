using System;
namespace Amis.Utils
{
    public static class DateTimeExtensions
    {
        public static long ToTimestamp(this DateTime value)
        {            
            long epoch = (value.Ticks - 621355968000000000) / 10000000;
            return epoch;         
        }
    }
}
