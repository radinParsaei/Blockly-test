// #define WASM_INPUT swalInput()
#include "VM.h"
#include <fstream>
#include "VM_binaries.h"
#include <emscripten/emscripten.h>

using namespace std;
using namespace VM_BINARIES;

VM vm;
vector<Value> mem;

int main() {
  vm.attachMem(&mem);
  vm.autoKill = false;
  vm.setInternalLibraryFunction([] (Value value, VM* vm1) {
    if (value == "runJS_str") {
      vm1->push(emscripten_run_script_string(vm1->pop().toString().c_str()));
    } else if (value == "runJS_int") {
      vm1->push(emscripten_run_script_int(vm1->pop().toString().c_str()));
    }
  });
}

#include <stdio.h>

#ifdef __cplusplus
extern "C" {
#endif

void EMSCRIPTEN_KEEPALIVE run(int opcode) {
  vm.run1(opcode, null);
}

void EMSCRIPTEN_KEEPALIVE runWithString(int opcode, char* string) {
  vm.run1(opcode, string);
}

void EMSCRIPTEN_KEEPALIVE runWithNumber(int opcode, char* number) {
  vm.run1(opcode, NUMBER(number));
}

void EMSCRIPTEN_KEEPALIVE runWithBool(int opcode, bool data) {
  vm.run1(opcode, data);
}

const char* EMSCRIPTEN_KEEPALIVE disassemble(int opcode) {
  return vm.disassemble(opcode, null).toString().c_str();
}

const char* EMSCRIPTEN_KEEPALIVE disassembleWithString(int opcode, const char* string) {
  return vm.disassemble(opcode, string).toString().c_str();
}

const char* EMSCRIPTEN_KEEPALIVE disassembleWithNumber(int opcode, const char* number) {
  return vm.disassemble(opcode, NUMBER(number)).toString().c_str();
}

const char* EMSCRIPTEN_KEEPALIVE disassembleWithBool(int opcode, bool data) {
  return vm.disassemble(opcode, data).toString().c_str();
}

const char* EMSCRIPTEN_KEEPALIVE pop() {
string tmp;
Value value = vm.getStack()[vm.getStack().size() - 1];
  if (value.getType() == VALUE_TYPE_NUMBER) {
    tmp = "N" + value.toString();
  } else if (value.getType() == VALUE_TYPE_TEXT) {
    tmp = "T" + value.toString();
  } else if (value.getType() == True || value.getType() == False) {
    tmp = "B";
    char a = value.getBool()? '1' : '0';
    tmp += a;
  } else if (value.getType() == null) {
    tmp = "0";
  }
  vm.getStack().pop_back();
  return strdup(tmp.c_str());
}
#ifdef __cplusplus
}
#endif
