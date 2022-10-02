# VPC

# CIDR explained

- There are 256 addresses per block i.e. in total there are
  256^4 = 4 294 967 296
- /16 means that 2 first blocks are fixed. One block is 8 bits (2^8=256). Then, two last blocks are free and there are 255^2=65536 addresses left.
- /24 means that 24 first bits of 32 are fixed. There are then 2^8=256 free bits to select
- /28 means that 28 first bits of 32 are fixed. There are then 2^4=16 free bits to select
