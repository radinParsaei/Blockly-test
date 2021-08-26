// #define VM_DISASSEMBLE
// #define VM_STACKLOG

#include <iostream>
#include <emscripten/emscripten.h>

inline std::string swalInput() {
  emscripten_run_script("Editor.getSwal().fire({input: \'text\'}).then(res => window[\'__COMPILER_INPUT\'] = res.value || \'\')");
  return "";
}