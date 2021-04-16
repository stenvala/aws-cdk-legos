#
# Route
# https://d2v2dlpiwo7bg9.cloudfront.net/?monoApi=https%3A%2F%2F0vhdwkgsdj.execute-api.eu-north-1.amazonaws.com%2Fprod%2F&amisApi=https%3A%2F%2F8ep28cbep6.execute-api.eu-north-1.amazonaws.com%2Fprod%2F

from urllib.parse import quote
import util
import argparse


def main(args):
    print_url('uiUrl', 'monoUrl', 'amisUrl', 'demoAuthUrl')    

    if args.aws:
        print('Trying also custom domain values')
        print_url('ui', 'mono', 'amis', 'demoauth')    
    
def print_url(ui, mono, amis, auth):
    ui = util.get_value(args.aws, ui)
    mono = util.get_value(args.aws, mono)
    amis = util.get_value(args.aws, amis)    
    print('To use service, copy paste this')
    print(ui + '?amisApi=' + quote(amis) + '&monoApi=' + quote(mono))

    authDemo = util.get_value(args.aws, auth)
    print('To test authorizer, copy this')
    print(ui + '?amisApi=' + quote(authDemo) + '&monoApi=' + quote(mono))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-aws', action='store_true',
                        help='Give this to use AWS end point, otherwise uses local')
    args = parser.parse_args()
    main(args)
