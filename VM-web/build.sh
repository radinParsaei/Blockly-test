if [[ -z "$LIBS_FLAGS" ]]
then
	LIBS_FLAGS="-I../Compiler/CompilerBackend/VM/libs/random ../Compiler/CompilerBackend/VM/libs/random/random.cpp -I../Compiler/CompilerBackend/VM/libs/input ../Compiler/CompilerBackend/VM/libs/input/input.cpp"
fi
emcc -c ../Compiler/CompilerBackend/VM/BigNumber/src/BigNumber/number.c
em++ -Os -std=c++14 -DSTD_INCLUDED -DUSE_READLINE -I../Compiler/CompilerBackend/VM/Value -I../Compiler/CompilerBackend/VM -I../Compiler/CompilerBackend/VM/libs -s WASM=1 --pre-js pre.js -DSTATIC_BUILD_MODE $LIBS_FLAGS -s MAIN_MODULE=1 -s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall', 'stringToUTF8']" -I../Compiler/CompilerBackend/VM/BigNumber/src/BigNumber ../Compiler/CompilerBackend/VM/VM.cpp web.cpp number.o ../Compiler/CompilerBackend/VM/BigNumber/src/BigNumber/BigNumber.cpp -o VM.html
cat pre.js
