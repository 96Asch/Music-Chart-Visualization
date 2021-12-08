import argparse
import glob, os
import json
from tqdm import tqdm

def parseStringIntoSet(text, stop_words=[]):
    sanitized = text.replace('\n', ' ').replace('  ', ' ')
    sanitized = sanitized.replace('(', '').replace(')', '')
    sanitized = sanitized.replace('?', '')
    sanitized = sanitized.replace(',', '')
    sanitized = sanitized.replace('"', '')
    sanitized = [word.lower() for word in sanitized.split(' ')]

    sanitized = [i for i in sanitized if i not in stop_words]
    return set(sanitized)

def main(args):
    files = [file for file in glob.glob('{}/*.json'.format(args.input))]
    files = sorted(files)
    stop_words = []
    with open(args.stopwords) as f:
        stop_words = f.readlines()
        stop_words = [word.strip() for word in stop_words]

    print(stop_words)
    dump = []

    for file in tqdm(files):
        jobjects = []
        with open(file, 'r', encoding='utf-8') as f:
            bb_year = json.load(f)
            unique_lyrics = [parseStringIntoSet(song['lyrics'], stop_words) for song in bb_year]
            
            word_count = {}

            for s1 in unique_lyrics:
                for w1 in s1:
                    if w1 not in word_count and w1 != '':
                        word_count[w1] = 0
                        for s2 in unique_lyrics:
                            if s1 != s2:
                                for w2 in s2:
                                    if w1 == w2:
                                        word_count[w1] += 1
                        if word_count[w1] == 0:
                            del word_count[w1]

            for k, v in word_count.items():
                if v > args.thresh:
                    jobjects.append(
                        {
                            "word" : k,
                            "ratio" : (v / len(bb_year))
                        }
                    )

            

        jsonObjects = {
            "year" : file.split('/')[-1].split('.')[0], 
            "words" : jobjects
            }
        dump.append(jsonObjects)

    with open(args.output, 'w', encoding='utf-8') as out:
        json.dump(dump, out)
    


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Counts the number of duplicate words per year')
    parser.add_argument('--input', type=str, required=True, help='Input folder')
    parser.add_argument('--output', type=str, required=True, help='Output file')
    parser.add_argument('--thresh', type=int, required=True, help='Output file')
    parser.add_argument('--stopwords', type=str, required=True, help='Output file')
    parser = parser.parse_args()
    main(parser)