# FlowJS
> A minimal reactive UI library 

<img src="https://imgur.com/a/XpEAP4P" width="200" height="100">


```Javascript 



export class Counter extends Flow.Component
{
    constructor(props)
    {
        super(props);
        this.state = 
        {
            count : 0 
        }
    }

    increase = () =>
    {
        this.setState({count : this.state.count+1})
    }

    decrease = () =>
    {
        this.setState({count : this.state.count-1})
    }

    render = () =>
    {
        return (
            <div className="counter-container">
                <div className="counter-count">{this.state.count}</div>

                <div onClick={this.increase} className="counter-button">+</div>
                <div onClick={this.decrease} className="counter-button">-</div>
            </div>
        )
    }
}

```
