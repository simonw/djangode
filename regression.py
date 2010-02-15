#!/usr/bin/python
import re, os
from subprocess import Popen, PIPE

print ""

cmd = 'find . -name "*.test.js"';
files = Popen(cmd, shell=True, stdout=PIPE).communicate()[0].splitlines()
failed_list = []

for file in files:
    output = Popen('node ' + file, shell=True, stdout=PIPE).communicate()[0].splitlines()
    try:
        result = [line for line in output if line.startswith('Total')][0]
    except:
        #bizarre, but sometimes popen apears to return empty strings
        #I'm too tired to fix this right now, so for now just retry and hope for better results
        output = Popen('node ' + file, shell=True, stdout=PIPE).communicate()[0].splitlines()
        result = [line for line in output if line.startswith('Total')][0]
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

