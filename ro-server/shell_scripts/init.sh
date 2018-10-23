#! /bin/bash

cat > ~/.ssh/id_rsa <<END
-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAu03tPP9tdnQsNCSefzriIdCRcNsqjif/LMUXUhiFTLRig1lt
qI9FPlaIiafGFdBf4mIUx5i89BxAFiujjRl595JnZwRfipgPJGZRu/G1GksrTsJh
CNCveb8xewKo0LULfKvMMARN6WA37dq096Vnz1UP9CMJPOBUQkyiBasR33/BRYK1
R/Dau6+z9RTq8rZRv5MbUW19ANvW3mBPch+L1JVGJmihY08to3EniY/Mn7dCJJIy
gJxaKWs9V/9J2u4+13uZLP1R+CIkwIbUnnqZQU2r2S2CPiGAFvU0b+OyaMKE0Yis
5fInDMzynwNx2EBlxeUFeTr6nv9pBLIJq21v2QIDAQABAoIBABUfmbS6Xb7xJRcQ
ViulGWGU4wImRWtYyWdkJtgkWcwnv8BucnaDCd0Y5zcXC7jkEhw20X8dE5o4IWYe
r8g26lFoWm78yEWaFoMVYvxeKv13IsA0HbtfxZpmXI8x4pX/BPefbFyx75N1PXl+
o9AWAFoajr0KwnzyE66Sc+dNvqtEzLdgTWKqsgbrD3/atX59cRzfQa/o0U3quZdU
leg9J+WKDlA4wER2KOu6HslfT1fQM4f1gTgSL6FkYHV79rZZD3+Zni20n0B2/uOm
1cxlshGLBSwmj6o0YhqwXm2S2+mLfy9XRwtMy8dDs/7TqL6+GgxeL5L6f4yHL7ci
yhEUkZ0CgYEA5QOFE+9ECU/kQj5yCwFfpyZV5Y378SBYygtD7EGatPtadV4pEhuo
mNm/66R0L5vnW/BxEjgrf5uORAimMXH5pkumF2hgPMxN+3ODHQYEKI2ze9KP0H9k
P77YQHTpoB5d25iyVbzr3x3KMkpoPPjSrYDUTeYcpA8eKM6/gpEI6qMCgYEA0WAx
fVwizSO2cJulojaUXj+WI0L+O7ygk98N74spOG5F8GVbs9BzcbRsiBQkJNI6ZS0h
rJONySWAozU3oSUcKAX1hNbooHoiQT89GDlVRtomX0yOh6KLFjBVcQVboFJhT4S+
tHOaWapg9ERog2FbMkdX3OhJpoCu/AjVN9L7/1MCgYBI+VUnY/+HBBkU7rcCQL7N
EU8fpZ2ZWRhR0UMkfkcg0lMhwQ5PQdb4VbJtEOsg3IndZwFwr8tUjynHDgZ/DPVj
Awn6vXylAuj6bfVigy9CCN0fYJoI8v7rvRFFgLuNFQANYFu7LEbwwppSahlLDHJ9
bOa5p9CKinKuyCqIHVT9BwKBgG+Zikd7eMFHK9NR4zNXTDYARpJ8/u3wWNb4qYDo
+AuwG29LV1m83gvZU5AkzC8kLyQGrlBCRezVJH/ZudEW6q8angc0VcJT1zZX8sSa
qq2dUZ6yO7ZoGSK2mJQpevE1d9DevJeKltb8TbllTR/aILXn+RkyZy9sn9iPDLc4
qkEpAoGAVuGowXZ4FY8JVzV/aWprIKUM7KVV43gYvTXHn9PfFpaqmD5GB9ID49PK
jNaaiZg4qXNJxZ4u0MEWBR7WRtQoKwgZB3igey51MP/wuenXS1JeanVhRkEGKyVz
5yH8xutBdSa3OQ7TgCs8uqGrnZWhn6lavj5c19mR8fd/JHBs3fE=
-----END RSA PRIVATE KEY-----
END
chmod 0600 ~/.ssh/id_rsa
cat > ~/.ssh/config <<END
Host *
    StrictHostKeyChecking no
END
ssh-agent /bin/bash
ssh-add ~/.ssh/id_rsa
git clone git@bitbucket.org:ddrouteopt/ro-server.git
yes | sudo apt-get update
yes | sudo apt-get upgrade
yes | sudo apt-get install
yes | sudo apt-get install node-gyp
apt-get install -y nodejs npm
apt-get install -y htop
ln -s /usr/bin/nodejs /usr/bin/node
cd /ro-server
tar -xzf node_modules.tar.gz
npm install -g pm2
npm install -g forever
npm install -g node-gyp
cd optimization-interface/cpp/lib
cp * /usr/lib
cd /ro-server
forever start app.js
cd /ro-server/optimization-interface/cpp
mkdir "test"
while [ ! -d "build" ]
do
  node-gyp rebuild
done
