import { api } from '@/trpc/react';
import { useRegisterActions } from 'kbar';
import { useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';

const useAccountSwitching = () => {
    const { data: accounts } = api.account.getAccounts.useQuery();
    const [_, setAccountId] = useLocalStorage('accountId', '');

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (event.metaKey && /^[1-9]$/.test(event.key)) {
                event.preventDefault();
                const index = Number(event.key) - 1;
                if (accounts?.[index]) setAccountId(accounts[index]!.id);
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [accounts]);

    useRegisterActions(
        [
            {
                id: 'accountsAction',
                name: 'Switch Account',
                shortcut: ['e', 's'],
                section: 'Accounts',
            },
            ...(accounts?.map((account) => ({
                id: account.id,
                name: account.name,
                parent: 'accountsAction',
                perform: () => setAccountId(account.id),
                keywords: [account.name, account.emailAddress].filter(Boolean).join(' '),
                section: 'Accounts',
                subtitle: account.emailAddress,
                priority: 1000,
            })) ?? []),
        ],
        [accounts]
    );
};

export default useAccountSwitching;