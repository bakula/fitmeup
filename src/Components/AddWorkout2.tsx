import { useCallback, useState } from "react";
import { InputNumber } from 'primereact/inputnumber';
export type Series = {
    mode:"initial"|"workout",
    repeats:number,
    weight:{
        value: number,
        unit:"kg"|"lbs",
        mode:"symetric"|"per arm"
    },

}
function getFromStorage<T> (key:string, defaultValue:T):T{
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value):defaultValue
}
function AddWorkout2(){
    const [series, setSeries] = useState<Series[]>(()=>getFromStorage<Series[]>("series", []))
    const addSeries = useCallback(()=>{
        setSeries([...series, {mode:"initial", repeats:1,  weight:{mode:"symetric", "unit":"kg", "value":10}}])
    }, [series])
    return <div>
        <h1>Series <small><button className="btn btn-primary" onClick={addSeries}>+</button></small></h1>
        <table>
            <tbody>
                {series?.map((theSeries, index)=><tr key={index}>
                    <td>{theSeries.mode}</td>
                    <td><InputNumber value={theSeries.repeats} showButtons buttonLayout="horizontal" step={0.25}
            decrementButtonClassName="p-button-danger" incrementButtonClassName="p-button-success" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus"
            mode="currency" currency="EUR" />{theSeries.repeats}</td>
                    </tr>)}
            </tbody>
        </table>
    </div>
}
export default AddWorkout2;