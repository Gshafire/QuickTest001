

$(document).ready(function () {
    if (currentTab == 'Home') {
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
                    CancelViewHandler();
                    append_table(json_result, node.text);
                }
            });

            // Listen for the nodeUnSelected event
            tree.on('nodeUnselected  ', function (event, node) {
                console.log("nodeUnselected");
                CancelViewHandler();
                append_table(json_result, "default");
            });

        }).fail(function () {
            console.log("An error has occurred.");
        });
    }
    

    $("#formProfile").submit(function (event) {
        event.preventDefault(); // Prevent the form from submitting

        // Get form data and do something with it
        var formData = $(this).serialize();
        console.log(formData);

        // Update the UI with the processed form data
        var username_str = $("[name='username']").val(); // Get the value from the input field
        var password_str = $("[name='password']").val(); // Get the value from the input field

        $("#outputUsername").text(username_str);
        $("#outputPassword").text(password_str);

        document.getElementById("input-ProfileForm").style.display = "none";
        document.getElementById("show-outputProfileForm").style.display = "block";

        // For example, you might want to display a message after processing
        //alert("Form data processed.");
       
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
    var showOutOfText = $('#show-OutOf');

    let currentPage = 0;
    const itemsPerPage = 5;

    let allData = [];
    allData = json_result;
    var total_result = getTotalRows(allData);
    var outOfIndex = 0;
    var endOutOfIndex = 0;

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
                                    <td>
                                        <a href="#" class="btn btn-info btn-xs">Edit</a>
                                        <a href="#" class="btn btn-success btn-xs view-btn">View</a>
                                        <a href="#" class="btn btn-danger btn-xs">Delete</a>
                                    </td>
                                </tr>
                            `);
                        }     
                        else if (countRows >= endIndex) {

                            attachViewButtonHandler();
                            // Update the pagination controls
                            currentPageSpan.text(`Page ${currentPage + 1}`);
                            var outOfIndex = currentPage + 1;
                            outOfIndex *= 5;
                            showOutOfText.text(`Showing ${outOfIndex} out of ${total_result} entities`);
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
                                <td>
                                    <a href="#" class="btn btn-info btn-xs">Edit</a>
                                    <a href="#" class="btn btn-success btn-xs view-btn">View</a>
                                    <a href="#" class="btn btn-danger btn-xs">Delete</a>
                                </td>
                            </tr>
                        `);
                        endOutOfIndex += 1;
                    }

                    countRows++;
                }
            }
        }

        attachViewButtonHandler();
        // Update the pagination controls
        // When there is no loop break, meant last few component
        currentPageSpan.text(`Page ${currentPage + 1}`);
        outOfIndex = currentPage + 1;
        outOfIndex *= 5;
        if (outOfIndex >= total_result) {
            outOfIndex = outOfIndex + (total_result - outOfIndex);
        }
        if (endOutOfIndex !== 0) {
            showOutOfText.text(`Showing ${endOutOfIndex} out of ${endOutOfIndex} entities`);
        }
        else {
            showOutOfText.text(`Showing ${outOfIndex} out of ${total_result} entities`);
        }
        prevPageButton.prop('disabled', currentPage === 0);
        nextPageButton.prop('disabled', endIndex >= total_result);
        return true;
    }

    prevPageButton.off('click');
    prevPageButton.click(function () {
        if (currentPage > 0) {
            currentPage--;
            attachViewButtonHandler();
            updateTable();
        }
    });


    nextPageButton.off('click');
    nextPageButton.click(function () {
        const totalPages = Math.ceil(total_result / itemsPerPage);
        if (currentPage < totalPages - 1 && filter_sel === "default") {
            currentPage++;
            attachViewButtonHandler();
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


// Attach the "View" button click handler using event delegation
function attachViewButtonHandler() {
    $(document).off("click", ".view-btn"); // Remove any existing handlers
    $(document).on("click", ".view-btn", function () {
        var row = $(this).closest("tr"); // Get the closest <tr> element
        var rowData = {
            brand: row.find("td:eq(0)").text(),
            modelName: row.find("td:eq(1)").text(),
            variantType: row.find("td:eq(2)").text(),
            variantYear: row.find("td:eq(3)").text(),
            variantColor: row.find("td:eq(4)").text()
        };

        // Update the UI with the processed form data
        $("[name='Brands']").text(rowData.brand);
        $("[name='Name']").text(rowData.modelName);
        $("[name='Years']").text(rowData.variantYear);
        $("[name='Type']").text(rowData.variantType);
        $("[name='Color']").text(rowData.variantColor);

        //Control UI
        document.getElementById("show-OutputTable").style.display = "none";
        document.getElementById("show-OutputDetails").style.display = "block";
    });
}

function CancelViewHandler() {
    $(document).off("click", ".view-btn"); // Remove any existing handlers
    //Control UI
    document.getElementById("show-OutputTable").style.display = "block";
    document.getElementById("show-OutputDetails").style.display = "none";
}

function calculateEntities() {

}
