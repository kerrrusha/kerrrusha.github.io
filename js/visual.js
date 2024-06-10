function createChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    type: 'linear',  // Use linear scale for y-axis
                    position: 'left'
                    //min: 0,
                }
            }
        }
    });
}

function deleteGraphFromArray(graphToDelete) {
    const indexToDeleteFromArray = graphs.findIndex(graph => graph.inputNumber === graphToDelete.inputNumber);

    if (indexToDeleteFromArray !== -1) {
        graphs.splice(indexToDeleteFromArray, 1);
        updateGraphsList();
    } else {
        console.error(`Can't find graph in array to delete: ${graphToDelete}`);
    }
}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}

function deleteGraphFromChartJs(graphToDelete) {
    const indexToRemove = chart.data.datasets.findIndex(dataset => arraysEqual(dataset.data, graphToDelete.sequence));

    if (indexToRemove !== -1) {
        chart.data.datasets.splice(indexToRemove, 1);
        chart.update();
    } else {
        console.error(`Can't find graph in ChartJS to delete: ${graphToDelete}`);
    }
}

function deleteGraph(graphToDelete) {
    deleteGraphFromArray(graphToDelete);
    deleteGraphFromChartJs(graphToDelete);
}

function updateGraphsList() {
    const graphsList = document.getElementById("graphsList");
    while (graphsList.firstChild) {
        graphsList.removeChild(graphsList.firstChild);
    }

    graphs.forEach(graph => {
        const newListItem = document.createElement('li');
        newListItem.classList.add("list-group-item");
        newListItem.classList.add("d-flex");
        newListItem.classList.add("flex-row");
        newListItem.classList.add("align-items-center");
        newListItem.classList.add("justify-content-between");

        const textContainer = document.createElement("div");
        textContainer.classList.add("d-flex");
        textContainer.classList.add("flex-column");
        newListItem.appendChild(textContainer);

        const textItem1 = document.createElement("span");
        textItem1.textContent = `Collatz(${graph.inputNumber})`;
        textItem1.classList.add("h6");
        textItem1.style.color = graph.color;
        textContainer.appendChild(textItem1);

        const textItem2 = document.createElement("span");
        textItem2.textContent = `length = ${graph.sequence.length}`;
        textItem2.classList.add("small");
        textContainer.appendChild(textItem2);

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn");
        deleteButton.classList.add("btn-outline-secondary");
        deleteButton.onclick = function() {
            deleteGraph(graph);
        };

        const deleteIcon = document.createElement("i");
        deleteIcon.textContent = "delete";
        deleteIcon.classList.add("material-icons");
        deleteButton.appendChild(deleteIcon);

        newListItem.appendChild(deleteButton);

        graphsList.appendChild(newListItem);
    });
}

function updateLabels() {
    // Collect all unique labels from datasets
    const uniqueLabels = new Set();
    chart.data.datasets.forEach(dataset => {
        dataset.data.forEach((_, index) => {
            uniqueLabels.add(index);
        });
    });

    // Update the chart's labels with the unique set of labels
    chart.data.labels = Array.from(uniqueLabels);
}

function graphExists(parsedInput) {
    for (let i = 0; i < graphs.length; i++) {
        let graph = graphs[i];
        if (graph.inputNumber === parsedInput) {
            return true;
        }
    }
    return false;
}

function buildSequence() {
    let inputValue;

    const selectedValue = getSelectedModeValue();
    if (selectedValue === 'default') {
        inputValue = parseInt(document.getElementById('inputValueDefault').value);
    } else if (selectedValue === 'binary') {
        inputValue = document.getElementById('inputValuePowerOfTwo').value;
        inputValue = parseInt(inputValue);
        inputValue = Math.pow(2, inputValue);
    }

    if (isNaN(inputValue)) {
        alert('Please enter a valid integer.');
        return;
    }
    if (graphExists(inputValue)) {
        alert('Such graph already exists.');
        return;
    }

    const graph = new CollatzGraph(inputValue, getRandomColor());
    graphs.push(graph);

    // Add the new dataset to the existing chart
    chart.data.datasets.push({
        label: `Collatz(${inputValue})`,
        borderColor: graph.color,
        borderWidth: 1,
        data: graph.sequence,
    });
    updateLabels();

    chart.update();

    updateGraphsList();
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

class CollatzGraph {
    constructor(inputNumber, color) {
        this.inputNumber = inputNumber;
        this.color = color;
        this.sequence = this.generateSequence();
    }

    generateSequence() {
        let n = this.inputNumber;
        const sequence = [n];
        while (Math.abs(n) !== 1) {
            if (n % 2 === 0) {
                n = n / 2;
            } else {
                n = 3 * n + (n >= 0 ? 1 : -1);
            }
            sequence.push(n);
        }
        return sequence;
    }
}

function getSelectedModeValue() {
    const selectMode = document.getElementById('input-mode-select');
    return selectMode.value;
}

function changeInputMode() {
    const inputDefault = document.getElementById('input-default');
    const inputBinary = document.getElementById('input-binary');

    const selectedValue = getSelectedModeValue();
    if (selectedValue === 'default') {
        inputDefault.style.display = 'block';
        inputBinary.style.display = 'none';
    } else if (selectedValue === 'binary') {
        inputDefault.style.display = 'none';
        inputBinary.style.display = 'block';
    }
}

changeInputMode();
let chart = createChart();
let graphs = [];
