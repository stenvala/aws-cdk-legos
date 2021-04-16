import json
import argparse


FILE = 'props.json'


def main(args):
    data = {
        'amisAuth': ask_input('What kind of authentication you want to have in the stack?', {
            'api': 'Auth lambda is used via RestAPI from authentication filter in mono (always the case for local development).',
            'demo': 'Auth lambda is connected to the passthrough demo lambda\'s API GW. Use it to see how API GW modifies request. Amis uses api.',
            'jwt': 'JWT authenticator in Amis API GW.',
            'lambda': 'Lambda authenticator in Amis API GW.'
        }, args.amisauth),
        'useCustomDomainName': ask_input('Do you want to use custom domain name?', {
            'n': 'no',
            'y': 'yes'
        }, args.domain)      
    }
    to_save = json.dumps(data, indent=4)

    with open(FILE, 'w') as f:
        f.write(to_save)


def ask_input(text, options, already_selected):
    if already_selected is not None and already_selected in options:
        return already_selected
    print(text)
    print('Allowed options')
    for i in options:
        print(f' - {i}: ' + options[i])
    inp = input()
    if not inp in options:
        print(f'{inp} is invalid input')
        return ask_input(text, options, None)
    else:
        print(f'You selected `{inp}`')
    return inp


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-amisauth', help='Authentication to amis: api, demo, jwt or lambda')
    parser.add_argument('-domain', help='Use custom domain: n / y')
    args = parser.parse_args()
    main(args)
