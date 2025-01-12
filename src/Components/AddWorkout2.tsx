import { useCallback, useState } from "react";
import { InputNumber } from 'primereact/inputnumber';
import {SeriesModeIcon} from './SeriesModeIcon'
export type Series = {
    mode:"initial"|"workout",
    repeats:number,
    weight:{
        value: number,
        unit:"kg"|"lbs",
        mode:"symetric"|"per arm"
    },

}
//todo: use import { useLocalStorage } from 'primereact/hooks';
function getFromStorage<T> (key:string, defaultValue:T):T{
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value):defaultValue
}
function AddWorkout2(){
    const [series, setSeries] = useState<Series[]>(()=>getFromStorage<Series[]>("series", [{mode:"initial", repeats:1,  weight:{mode:"symetric", "unit":"kg", "value":10}},{mode:"workout", repeats:1,  weight:{mode:"symetric", "unit":"kg", "value":10}}]))
    const addSeries = useCallback(()=>{
        setSeries([...series, {mode:"workout", repeats:1,  weight:{mode:"symetric", "unit":"kg", "value":10}}])
    }, [series])
    return <div className="addWorkout">
        <h1>Series <small><button className="btn btn-primary" onClick={addSeries}>+</button></small></h1>
        <table>
            <tbody>
                {series?.map((theSeries, index)=><tr key={index}>
                    <td><SeriesModeIcon mode={theSeries.mode} /></td>
                    <td><InputNumber value={theSeries.repeats} showButtons buttonLayout="horizontal" step={1}
            decrementButtonClassName="p-button-danger" incrementButtonClassName="p-button-success" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus"
            mode="decimal" size={3} suffix={" reps"} />{theSeries.repeats}</td>
                    </tr>)}
            </tbody>
        </table>
    </div>
}
export default AddWorkout2; 