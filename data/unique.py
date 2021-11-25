import argparse
import re
import random

jsonRegex = '\[+|\]+|\{+|\}+|\$+'

def main(args):
    regex = re.compile(jsonRegex)
    lines = ''
    with open(args.input, 'rt') as f:
        lines = f.readlines()
        for line in lines:
            
            if not regex.search(line):
                occurences = [i for i, l in enumerate(lines) if l == line]
               
                if (len(occurences) > 1):
                    keep_index = random.choice(occurences)
                    print('{} : {}'.format(line[:-1], len(occurences)))
                    for dup in occurences:
                        lines[dup] = '$'
        
    with open(args.output, 'w') as f:
        lines = [line for line in lines if line != '$']
        f.write(''.join(lines))   

            


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Removes duplicates from random places.')
    parser.add_argument('--input', type=str, required=True, help='Input file')
    parser.add_argument('--output', type=str, required=True, help='Output file')
    parser = parser.parse_args()
    main(parser)