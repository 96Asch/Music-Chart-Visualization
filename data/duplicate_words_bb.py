import argparse
import glob, os
import json

def main(args):
    files = [file for file in glob.glob('{}/*.json'.format(args.input))]
    files = sorted(files)
    for file in files:
        with open(file) as f:
            bb_year = json.load(f)
            lyrics_year = [song['lyrics'] for song in bb_year]]
            
            print('Year: {} - {}'.format(file, [song['title'] for song in bb_year]))
    


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Counts the number of duplicate words per year')
    parser.add_argument('--input', type=str, required=True, help='Input folder')
    parser.add_argument('--output', type=str, required=True, help='Output file')
    parser = parser.parse_args()
    main(parser)