#!/usr/bin/env python3

import csv
import argparse
import re
import random

jsonRegex = '\[+|\]+|\{+|\}+|\$+'

def main(args):
    lines = ''
    regex = re.compile(jsonRegex)
    with open(args.input, 'rt') as f:
        lines = f.readlines()
        for line in lines:
            if regex.search(line):
                continue
            occurences = [i for i, l in enumerate(lines) if l == line]
            if (len(occurences) <= 1):
                continue
            keep_index = random.choice(occurences)
            print('{} : {}'.format(line[:-1], len(occurences)))
            for dup in occurences:
                lines[dup] = '$'
        
    with open(args.output, 'w') as f:
        lines = [line for line in lines if line != '$']
        f.write(''.join(lines))   


def only_csv_cols(filename, cols):
    with open(filename, newline='') as csvfile:
        reader = csv.reader(csvfile, delimiter=',', quotechar='"')
        header = next(reader)
        keepcols = [ i for i,h in enumerate(header) if h in cols ]
        print(",".join([ header[i] for i in keepcols ]))
        for line in reader:
            print(",".join([ line[i] for i in keepcols ]))


if __name__ == '__main__':
    only_csv_cols("song_ranking.csv", ["weekid", "week_position", "song", "performer"])
    #parser = argparse.ArgumentParser(description='Removes duplicates from random places.')
    #parser.add_argument('--input', type=str, required=True, help='Input file')
    #parser.add_argument('--output', type=str, required=True, help='Output file')
    #parser = parser.parse_args()
    #main(parser)
