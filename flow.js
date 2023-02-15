

/** @jsx react.createElement */
/**  FlowJS Library  **/

/*
MIT License

Copyright (c) Labinot Curroja.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


const __DEV__         = true 
const __VER__         = "0.5"
const __NAME__        = "FlowJS Library"
const __CONCURRENCY__ = true 

function __log__(data)
{
  if(__DEV__)
  {
    console.log(data)
  }
}

function __error__(message)
{
  throw new Error(message)
}


function importFlowJS() 
{
  let rootInstance   = null;
  let TEXT_ELEMENT   = "TEXT_ELEMENT";


  function createElement(type, config, ...args) 
  {

    const props       = Object.assign({}, config);
    const hasChildren = args.length > 0;
    const rawChildren = hasChildren ? [].concat(...args) : [];

    props.children    = rawChildren.filter(c => c != null && c !== false).map(c => c instanceof Object ? c : createTextElement(c));

    return { type, props };
  }

  function createTextElement(value) 
  {
    return createElement(TEXT_ELEMENT, { nodeValue: value });
  }

  function render(element, container) 
  {
    const prevInstance = rootInstance;
    const nextInstance = reconcile(container, prevInstance, element);
    rootInstance       = nextInstance;
  }


  /* update, create, remove, replace a node, called reconcile */
  function reconcile(parentDom, instance, element) 
  {

    if (instance == null) 
    {
      // Create instance
      const newInstance = instantiate(element);
      parentDom.appendChild(newInstance.dom);

      return newInstance;
    } 

    else if (element == null) 
    {
      // Remove instance
      /* componentWillUnMount */
      parentDom.removeChild(instance.dom);
      return null;
    } 
    else if (instance.element.type !== element.type) 
    {
      // Replace instance
      const newInstance = instantiate(element);
      parentDom.replaceChild(newInstance.dom, instance.dom);
      return newInstance;
    } 
    else if (typeof element.type === "string") 
    {

      // Update instance
      updateDomProperties(instance.dom, instance.element.props, element.props);
      instance.childInstances = reconcileChildren(instance, element);
      instance.element        = element;
      return instance;
    } 
    else 
    { 
      instance.publicInstance.componentDidUpdate()

      //Update composite instance
      instance.publicInstance.props = element.props;
      const childElement            = instance.publicInstance.render();
      const oldChildInstance        = instance.childInstance;
      const childInstance           = reconcile( parentDom, oldChildInstance, childElement);
      instance.dom                  = childInstance.dom;
      instance.childInstance        = childInstance;
      instance.element              = element;

      return instance;
    }
    
  }

  function reconcileChildren(instance, element) 
  {
    const dom               = instance.dom;
    const childInstances    = instance.childInstances;
    const nextChildElements = element.props.children || [];
    const newChildInstances = [];
    const count             = Math.max(childInstances.length, nextChildElements.length);
    for (let i = 0; i < count; i++) 
    {
      const childInstance    = childInstances[i];
      const childElement     = nextChildElements[i];
      const newChildInstance = reconcile(dom, childInstance, childElement);
      newChildInstances.push(newChildInstance);
    }
    return newChildInstances.filter(instance => instance != null);
  }

  function instantiate(element) 
  {

    const { type, props } = element;
    const isDomElement    = typeof type === "string";

    if (isDomElement) 
    {
      // Instantiate DOM element
      const isTextElement = type === TEXT_ELEMENT;
      const dom           = isTextElement ? document.createTextNode("") : document.createElement(type);

      updateDomProperties(dom, [], props);

      const childElements  = props.children || [];
      const childInstances = childElements.map(instantiate);
      const childDoms      = childInstances.map(childInstance => childInstance.dom);
      childDoms.forEach(childDom => dom.appendChild(childDom));

      const instance = { dom, element, childInstances };
      return instance;
    } 
    else 
    {
      // Instantiate component element
      const instance       = {};
      const publicInstance = createPublicInstance(element, instance);
      const childElement   = publicInstance.render();
      const childInstance  = instantiate(childElement);
      const dom            = childInstance.dom;

      /* componentDidMount is called here. This only is called once */
      publicInstance.componentDidMount()


      Object.assign(instance, { dom, element, childInstance, publicInstance }); 
      
      return instance;
    }



  }

  function updateDomProperties(dom, prevProps, nextProps) 
  {

    const isEvent     = name => name.startsWith("on");
    const isAttribute = name => !isEvent(name) && name != "children";
    const isStyle     = name => name == "style";


    // Remove event listeners
    Object.keys(prevProps).filter(isEvent).forEach(name => 
    {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });
    

    // Remove attributes
    Object.keys(prevProps).filter(isAttribute).forEach(name => 
    {
        dom[name] = null;
    });
    

    // Add event listeners
    Object.keys(nextProps).filter(isEvent).forEach(name => 
    {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });


    // Set attributes
    Object.keys(nextProps).filter(isAttribute).forEach(name => 
    {
      dom[name] = nextProps[name];
    });
    

    // Add style to node
    Object.keys(nextProps).filter(isStyle).forEach(name => 
    {
      for (const [key, value] of Object.entries(nextProps[name])) 
      {
        dom.style[key] = value;
      }
    });


  }

  function createPublicInstance(element, internalInstance) 
  {
    const { type, props } = element;
    const publicInstance  = new type(props); // new instance of some class
    publicInstance.__internalInstance = internalInstance;
    return publicInstance;
  }

  function updateInstance(internalInstance) 
  {
    const parentDom = internalInstance.dom.parentNode;
    const element   = internalInstance.element;
    reconcile(parentDom, internalInstance, element);
  }

  class Component 
  {
    constructor(props) 
    {
      this.props              = props;
      this.state              = this.state || {};
      this.__internalInstance = null;
    }

    setState(partialState) 
    {
      var self   = this 
      this.state = Object.assign({}, this.state, partialState);

      if(__CONCURRENCY__)
      {
        requestAnimationFrame(function(timestep)
        {
          updateInstance(self.__internalInstance);
        })
      }
      else 
      {
        updateInstance(self.__internalInstance);
      }

    }

    render()
    {
      throw new Error("Component.render function has to be implemented!");
    }

    componentDidMount(){}
    componentDidUnmount(){}
    componentDidUpdate(){}
    componentWillUpdate(){}

  }

 

  return {

    meta : 
    {
      DEBUG   : false,
      VERSION : "0.5",
      NAME    : "FlowJS",
      DESC    : "Declarative UI Library for the Web.",
      FIXES   : "Added support for componentDidMount() && componentDidUpdate()"
    },

    createElement,
    render,
    Component,

  };
}

window.Flow = importFlowJS();

