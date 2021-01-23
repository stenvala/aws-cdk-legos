#
# Route
# https://d2v2dlpiwo7bg9.cloudfront.net/?monoApi=https%3A%2F%2F0vhdwkgsdj.execute-api.eu-north-1.amazonaws.com%2Fprod%2F&amisApi=https%3A%2F%2F8ep28cbep6.execute-api.eu-north-1.amazonaws.com%2Fprod%2F

from urllib.parse import quote
import util
import argparse


def main(args):
    ui = util.get_value(args.aws, 'uiUrl')
    mono = util.get_value(args.aws, 'monoUrl')
    amis = util.get_value(args.aws, 'amisUrl')

    print('To use service, copy paste this')
    print(ui + '?amisApi=' + quote(amis) + '&monoApi=' + quote(mono))

    authDemo = util.get_value(args.aws, 'demoAuthUrl')
    print('To test authorizer, copy this')
    print(ui + '?amisApi=' + quote(authDemo) + '&monoApi=' + quote(mono))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-aws', action='store_true',
                        help='Give this to use AWS end point, otherwise uses local')
    args = parser.parse_args()
    main(args)
