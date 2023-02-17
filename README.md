# FlowJS
> A minimal reactive UI library 

<img src="https://i.imgur.com/jFgGR65.png" width="200" height="100">


```Javascript 


> Example Component 
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
