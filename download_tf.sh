#!/bin/bash
URL="https://files.pythonhosted.org/packages/08/29/136ed5708a8b3f82bb6a06fd514c6c4578cd628e1ec404c9f7772f9372c2/tensorflow_cpu-2.13.0-cp39-cp39-macosx_10_15_x86_64.whl"
FILE="/tmp/tf.whl"
echo "Downloading $URL"
curl -C - -L -o "$FILE" "$URL"
while [ $? -ne 0 ]; do
    echo "Network drop, resuming..."
    sleep 2
    curl -C - -L -o "$FILE" "$URL"
done
echo "Download complete."
