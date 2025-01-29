import { Action, useRegisterActions } from 'kbar';
import { useTheme } from 'next-themes'

const useThemeSwitching = () => {
    const {theme,setTheme}=useTheme();
    const toggleTheme=()=>{
        setTheme(theme==='light'?'dark':'light')
    }
    const themeActions:Action[]=[
        {
            id:'light',
            name:'Light',
            shortcut:['l'],
            keywords:'light',
            section:'Theme',
            perform:()=>{
                setTheme('light')
            }
        },
        {
            id:'dark',
            name:'Dark',
            shortcut:['d'],
            keywords:'dark',
            section:'Theme',
            perform:()=>{
                setTheme('dark')
            }
        },
        {
            id:'toggle',
            name:'Toggle',
            shortcut:['t'],
            keywords:'toggle',
            section:'Theme',
            perform:toggleTheme
        }
    ]
    useRegisterActions(themeActions,[theme])
}

export default useThemeSwitching