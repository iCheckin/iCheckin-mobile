import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeohashService {
  BASE32_CODES: string;
  BASE32_CODES_DICT: object;
  ENCODE_AUTO: string;
  SIGFIC_HASH_LENGTH: number[];

  constructor() {
    this.BASE32_CODES = "0123456789bcdefghjkmnpqrstuvwxyz";
    this.BASE32_CODES_DICT = {};
    for(var i = 0; i < this.BASE32_CODES.length; i++){
      this.BASE32_CODES_DICT[this.BASE32_CODES.charAt(i)] = i;
    }
    this.ENCODE_AUTO = "auto";
    this.SIGFIC_HASH_LENGTH = [0, 5, 7, 8, 11, 12, 13, 15, 16, 17, 18];
  }

  encode(latitude: number, longitude: number, numberOfChars: number = 7): string{
    var chars = [],
        bits = 0,
        bitsTotal = 0,
        hash_value = 0,
        maxLat = 90,
        minLat = -90,
        maxLon = 180,
        minLon = -180,
        mid;

    while(chars.length < numberOfChars){
      if(bitsTotal % 2 === 0){
        mid = (maxLon + minLon) / 2;
        if(longitude > mid){
          hash_value = (hash_value << 1) + 1;
          minLon = mid;
        } else {
          hash_value = (hash_value << 1) + 0;
          maxLon = mid;
        }
      } else {
        mid = (maxLat + minLat) / 2;
        if(latitude > mid){
          hash_value = (hash_value << 1) + 1;
          minLat = mid;
        } else {
          hash_value = (hash_value << 1) + 0;
          maxLat = mid;
        }
      }

      bits++;
      bitsTotal++;
      if(bits === 5){
        var code = this.BASE32_CODES[hash_value];
        chars.push(code);
        bits = 0;
        hash_value = 0;
      }
    }
    return chars.join('');
  }

  decode_bbox(hash_string: string) {
    var isLon = true,
        maxLat = 90,
        minLat = -90,
        maxLon = 180,
        minLon = -180,
        mid;
    
    var hashValue = 0;
    for (var i = 0, l = hash_string.length; i < l; i++) {
      var code = hash_string[i].toLowerCase();
      hashValue = this.BASE32_CODES_DICT[code];

      for(var bits = 4; bits >= 0; bits--) {
        var bit = (hashValue >> bits) & 1;
        if (isLon) {
          mid = (maxLon + minLon) / 2;
          if (bit === 1) minLon = mid;
          else maxLon = mid;
        } else {
          mid = (maxLat + minLat) / 2;
          if (bit === 1) minLat = mid;
          else maxLat = mid;
        }
        isLon = !isLon;
      }
    }
    return [minLat, minLon, maxLat, maxLon];
  }

  decode(hashString: string){
    var bbox = this.decode_bbox(hashString);
    var lat = (bbox[0] + bbox[2]) / 2;
    var lon = (bbox[1] + bbox[3]) / 2;
    var latErr = bbox[2] - lat;
    var lonErr = bbox[3] - lon;
    return {latitude: lat, longitude: lon, 
      error: {latitude: latErr, longitude: lonErr}};
  }

  neighbor(hashString: string, direction: [number, number]){
    var lonLat = this.decode(hashString);
    var neighborLat = lonLat.latitude
      + direction[0] * lonLat.error.latitude * 2;
    var neighborLon = lonLat.longitude
      + direction[1] * lonLat.error.longitude * 2;
    return this.encode(neighborLat, neighborLon, hashString.length);
  }

  /**
   * Neighbors
   *
   * Returns all neighbors' hash integers clockwise from north around to northwest
   * 7 0 1
   * 6 x 2
   * 5 4 3
   */
  neighbors(hash_string: string) {
    var hashstringLength = hash_string.length;

    var lonlat = this.decode(hash_string);
    var lat = lonlat.latitude;
    var lon = lonlat.longitude;
    var latErr = lonlat.error.latitude * 2;
    var lonErr = lonlat.error.longitude * 2;

    var neighbor_lat,
        neighbor_lon;
    
    var neighborHashList = [
      this.neighbor(hash_string, [1,0]),
      this.neighbor(hash_string, [1,1]),
      this.neighbor(hash_string, [0,1]),
      this.neighbor(hash_string, [-1,1]),
      this.neighbor(hash_string, [-1,0]),
      this.neighbor(hash_string, [-1,-1]),
      this.neighbor(hash_string, [0,-1]),
      this.neighbor(hash_string, [1,-1])
    ];

    return neighborHashList;
  }
}
