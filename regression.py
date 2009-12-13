#!/usr/bin/python
import re, os

print ""

cmd = 'find . -name "*.test.js"';
files = [file.rstrip('\n') for file in os.popen(cmd).readlines()]

failed_list = []

for file in files:
    output = os.popen('node ' + file).readlines()
    result = [line.rstrip('\n') for line in output if line.startswith('Total')][0]
    (total, failed, error) = re.split(r':|,', result)[1::2]

    if int(failed) > 0 or int(error) > 0:
        failed_list.append(file)

    print file
    print '\t', result

if failed_list:
    print '\nWARNING! There were failed tests:'
    for file in failed_list:
        print file
    print ""
    exit(1)
print ""
exit(0)

