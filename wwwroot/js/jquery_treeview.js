

$(document).ready(function () {
    $.getJSON("/sampledata/mock01.json", function (json_result) {

        //Convert data type and put to bootstrap treeview lib
        const trans_data = transformDataForTreeview(json_result);
        const tree = $('#mytree').treeview({
            data: trans_data
        });

        //Initial when doc ready
        append_table(json_result, "default");

        // Listen for the nodeSelected event
        tree.on('nodeSelected', function (event, node) {
            // Check if the selected node has child nodes (parent node)
            if (node.nodes && node.nodes.length > 0 && node.text !== "default") {
                console.log('A parent node is selected:', node.text);
                append_table(json_result, node.text);
            }
        });

        // Listen for the nodeUnSelected event
        tree.on('nodeUnselected  ', function (event, node) {
            console.log("nodeUnselected");
            append_table(json_result, "default");
        });

    }).fail(function () {
        console.log("An error has occurred.");
    });
});



//Convert getJson result to Javascript array object (3 nodes) for treeview
//Only 3 layer of json could done for the current app. 
function transformDataForTreeview(data) {
    const treeData = [];

    for (const brand of data) {
        const brandNode = {
            text: brand.brand,
            nodes: []
        };

        for (const model of brand.models) {
            const modelNode = {
                text: model.name,
                nodes: []
            };

            for (const variant of model.variants) {
                const variantNode = {
                    text: `${variant.type} - ${variant.year} - ${variant.color}`
                };

                modelNode.nodes.push(variantNode);
            }

            brandNode.nodes.push(modelNode);
        }
        treeData.push(brandNode);
    }

    return treeData;
}


//This function is to extract data from json file
//Then move to html table by Js, maximum 5 rows 1 page
function append_table(json_result, filter_sel) {

    var tableBody = $('#data-table');
    var prevPageButton = $('#prevPage');
    var nextPageButton = $('#nextPage');
    var currentPageSpan = $('#currentPage');

    let currentPage = 0;
    const itemsPerPage = 5;

    let allData = [];
    allData = json_result;
    var total_result = getTotalRows(allData);

    updateTable();

    function updateTable()
    {
        tableBody.empty();
        let startIndex = currentPage * itemsPerPage;  //0, 5,10,15,20,25,30
        let endIndex = startIndex + itemsPerPage;     //5,10,15,20,25,30,35
        let countRows = 0;
        let countRows_sel = 0;

        for (let i = 0; i < allData.length; i++) {
            const brandItem = allData[i];
            const brand = brandItem.brand;

            for (let ii = 0; ii < brandItem.models.length; ii++)
            {
                const modelItem = brandItem.models[ii];
                const modelName = modelItem.name;

                for(let iii = 0; iii < modelItem.variants.length; iii++)
                {
                    const variantItem = modelItem.variants[iii];
                    const variantType = variantItem.type;
                    const variantYear = variantItem.year;
                    const variantColor = variantItem.color;

                    if (filter_sel == "default")
                    {
                        if (countRows >= startIndex && countRows < endIndex) {

                            tableBody.append(`
                                <tr>
                                    <td>${brand}</td>
                                    <td>${modelName}</td>
                                    <td>${variantType}</td>
                                    <td>${variantYear}</td>
                                    <td>${variantColor}</td>
                                </tr>
                            `);
                        }     
                        else if (countRows >= endIndex) {

                            // Update the pagination controls
                            currentPageSpan.text(`Page ${currentPage + 1}`);
                            prevPageButton.prop('disabled', currentPage === 0);
                            nextPageButton.prop('disabled', endIndex >= total_result);
                            return true;
                        }
                    }
                    if (filter_sel != "default" && filter_sel == brand || filter_sel == modelName || filter_sel == variantType || filter_sel == variantYear || filter_sel == variantColor) {

                        tableBody.append(`
                            <tr>
                                <td>${brand}</td>
                                <td>${modelName}</td>
                                <td>${variantType}</td>
                                <td>${variantYear}</td>
                                <td>${variantColor}</td>
                            </tr>
                        `);
                    }

                    countRows++;
                }
            }
        }

        // Update the pagination controls
        // When there is no loop break, meant last few component
        currentPageSpan.text(`Page ${currentPage + 1}`);
        prevPageButton.prop('disabled', currentPage === 0);
        nextPageButton.prop('disabled', endIndex >= total_result);
        return true;
    }

    prevPageButton.click(function () {
        if (currentPage > 0) {
            currentPage--;
            updateTable();
        }
    });

    nextPageButton.off('click');

    nextPageButton.click(function () {
        const totalPages = Math.ceil(total_result / itemsPerPage);
        if (currentPage < totalPages - 1 && filter_sel === "default") {
            currentPage++;
            updateTable();
        }
    });
}

function getTotalRows(allData) {

    var totalCount = 0;
    for (let i = 0; i < allData.length; i++) {
        const brandItem = allData[i];
        const brand = brandItem.brand;

        for (let ii = 0; ii < brandItem.models.length; ii++) {
            const modelItem = brandItem.models[ii];
            const modelName = modelItem.name;
            for (let iii = 0; iii < modelItem.variants.length; iii++) {
                totalCount++;
            }
        }
    }

    //Debug
    console.log("totalCount:" + totalCount);
    return totalCount;
}


