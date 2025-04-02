// __mocks__/os.js
module.exports = {
    cpus: jest.fn(() => [
      { model: 'Intel(R) Core(TM) i7-9750H', speed: 2600, times: {} },
      { model: 'Intel(R) Core(TM) i7-9750H', speed: 2600, times: {} }
    ]),
    endianness: jest.fn(() => 'LE'),
    hostname: jest.fn(() => 'mock-hostname'),
    platform: jest.fn(() => 'linux'),
    release: jest.fn(() => '5.15.0-101-generic'),
    arch: jest.fn(() => 'x64'),
    type: jest.fn(() => 'Linux'),
    totalmem: jest.fn(() => 17179869184), // 16GB
    freemem: jest.fn(() => 8589934592),   // 8GB
    networkInterfaces: jest.fn(() => ({
      eth0: [{ address: '192.168.1.2', family: 'IPv4', internal: false }]
    })),
    userInfo: jest.fn(() => ({
      uid: 1000,
      gid: 1000,
      username: 'mockuser',
      homedir: '/home/mockuser',
      shell: '/bin/bash'
    })),
    // Add any other os methods you use
  };