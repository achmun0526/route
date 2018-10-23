{
  "targets": [
    {
      "target_name": "Node_Linker",
      "sources": [ "src/Link.cpp",
                "src/Link_Node.cc",


      ],
      "libraries": [ "-loptimization-algorithm","-lcurl"],
      "cflags": ["-Wall",
       "-std=c++11",
       "-fPIC"],
      'xcode_settings': {
        'OTHER_CFLAGS': [
          '-std=c++11',
          "-fPIC"
        ],
      },
      'include_dirs':[
      "include",
      "/usr/local/include",
      "include/curl",
      "src",
      "lib",
      ],
      'msvs_settings': {
        'VCCLCompilerTool': {
          'ExceptionHandling': 1 # /EHsc
        }
      },
      'configurations': {
        'Release': {
          'msvs_settings': {
            'VCCLCompilerTool': {
            'ExceptionHandling': 1,
          }
        }
      }
      },
      "conditions": [
        [ 'OS=="mac"', {
            "xcode_settings": {
                'OTHER_CPLUSPLUSFLAGS' : ['-std=c++11','-stdlib=libc++'],
                'OTHER_LDFLAGS': ['-stdlib=libc++'],
                'MACOSX_DEPLOYMENT_TARGET': '10.7' }
            }
        ]
      ]
    }
  ]
}
