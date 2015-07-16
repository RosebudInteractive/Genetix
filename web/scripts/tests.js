/**
 * User: kiknadze
 * Date: 10.07.2015
 * Time: 13:20
 */
function genetixBuildExample1() {
    $u.add('GenVContainer', 'MainContainer', {Width:"100%", Height:"100%"}, 'EmptyForm');
    $u.add('GenVContainer', 'Container1', {Width:"100%", Height:"100%"}, 'MainContainer');
    $u.add('GenDataGrid', 'GenDataGrid1', {Width:"100%", Height:"50%"}, 'Container1');
    $u.add('HContainer', 'HContainer1', {Width:"100%", Height:"50%"}, 'Container1');
    $u.add('GenVContainer', 'Container2', {Width:"100%", Height:"200px", Background: "blue"}, 'Container1');
    $u.r();
}

function genetixBuildExample2() {
    $u.add('GenVContainer', 'MainContainer', {Width:"100%", Height:"100%"}, 'EmptyForm');
    $u.add('GenVContainer', 'Container1', {Width:"100%", Height:"100%"}, 'MainContainer');
    $u.add('GenDataGrid', 'GenDataGrid1', {Width:"100%", Height:"50%"}, 'Container1');
    $u.add('HContainer', 'HContainer1', {Width:"100%", Height:"50%"}, 'Container1');
    $u.add('GenVContainer', 'Container2', {Width:"100%", Height:"200px", Background: "blue"}, 'Container1');
    $u.add('GenVContainer', 'Container3', {Width:"30%", Height:"100%", Background: "red"}, 'HContainer1');
    $u.add('GenVContainer', 'Container4', {Width:"30%", Height:"100%", Background: "grey"}, 'HContainer1');
    $u.add('GenVContainer', 'Container5', {Width:"40%", Height:"100%", Background: "yellow"}, 'HContainer1');
    $u.r();
}

function genetixBuildExample3() {
    $u.add('GenVContainer', 'MainContainer', {Width:"100%", Height:"100%"}, 'EmptyForm');
    $u.add('GenVContainer', 'Container1', {Width:"100%", Height:"100%"}, 'MainContainer');
    $u.add('GenDataGrid', 'GenDataGrid1', {Width:"100%", Height:"50%"}, 'Container1');
    $u.add('HContainer', 'HContainer1', {Width:"100%", Height:"50%"}, 'Container1');
    $u.add('GenVContainer', 'Container2', {Width:"100%", Height:"200px", Background: "blue"}, 'Container1');
    $u.add('GenVContainer', 'Container3', {Width:"30%", Height:"100%", Background: "red", PadLeft: "20px"}, 'HContainer1');
    $u.add('GenVContainer', 'Container4', {Width:"30%", Height:"100%", Background: "grey"}, 'HContainer1');
    $u.add('GenVContainer', 'Container5', {Width:"40%", Height:"100%", Background: "yellow"}, 'HContainer1');
    $u.add('GenVContainer', 'Container6', {Width:"100%", Height:"100%", PadTop: "5%", Background: "yellow"}, 'Container5');
    $u.r();
}

function genetixBuildExample4() {
    $u.add('GenVContainer', 'MainContainer', {Width:"100%", Height:"100%"}, 'EmptyForm');
    $u.add('GenVContainer', 'Container1', {Width:"100%", Height:"100%"}, 'MainContainer');
    $u.add('GenDataGrid', 'GenDataGrid1', {Width:"100%", Height:"50%"}, 'Container1');
    $u.add('HContainer', 'HContainer1', {Width:"100%", Height:"50%"}, 'Container1');
    $u.add('GenVContainer', 'Container2', {Width:"100%", Height:"200px", Background: "blue"}, 'Container1');
    $u.add('GenVContainer', 'Container3', {Width:"30%", Height:"100%", Background: "red", PadLeft: "20px"}, 'HContainer1');
    $u.add('GenVContainer', 'Container4', {Width:"30%", Height:"100%", Background: "grey"}, 'HContainer1');
    $u.add('GenVContainer', 'Container5', {Width:"40%", Height:"100%", Background: "yellow"}, 'HContainer1');
    $u.add('GenVContainer', 'Container6', {Width:"100%", Height:"100%", Background: "yellow"}, 'Container5');

    $u.add('GenVContainer', 'Container7',
        { Width:"100%", Height:"100%",
            PadTop: "5%", PadRight: "5%",PadLeft: "5%",PadBottom: "5%",
            Background: "greenyellow", MinHeight: "200px", MinWidth: "200px"},
        'Container4');
    $u.r();
}

function genetixBuildExample5() {
    $u.add('GenVContainer', 'MainContainer', {Width:"100%", Height:"100%"}, 'EmptyForm');
        $u.add('GenVContainer', 'Container1', {Width:"100%", Height:"100%"}, 'MainContainer');
            $u.add('GenVContainer', 'VContainer1', {Width:"100%", Height:"50%", MinHeight: "150px"}, 'Container1');
                $u.add('GenVContainer', 'VContainer2', {Width:"100%", Height:"100%", MinHeight: "200px"}, 'VContainer1');
                    $u.add('GenVContainer', 'VContainer3',
                        {
                            Width:"100%", Height:"100%", MinHeight: "250px",
                            PadTop: "5%", PadRight: "5%",PadLeft: "5%",PadBottom: "5%",
                            Background: "green"
                        }, 'VContainer2');
            $u.add('HContainer', 'HContainer1', {Width:"100%", Height:"50%"}, 'Container1');
                $u.add('GenVContainer', 'Container3', {Width:"30%", Height:"100%", Background: "red", PadLeft: "20px"}, 'HContainer1');
                $u.add('GenVContainer', 'Container4', {Width:"30%", Height:"100%", Background: "grey"}, 'HContainer1');
                    $u.add('GenVContainer', 'Container7',
                        { Width:"100%", Height:"100%",
                            PadTop: "5%", PadRight: "5%",PadLeft: "5%",PadBottom: "5%",
                            Background: "greenyellow", MinHeight: "200px", MinWidth: "200px"},
                        'Container4');
                $u.add('GenVContainer', 'Container5', {Width:"40%", Height:"100%", Background: "yellow"}, 'HContainer1');
                    $u.add('GenVContainer', 'Container6', {Width:"100%", Height:"100%", Background: "yellow"}, 'Container5');
            $u.add('GenVContainer', 'Container2', {Width:"100%", Height:"200px", Background: "blue"}, 'Container1');
                $u.add('GenDataGrid', 'GenDataGrid1', {Width:"100%", Height:"100%", MinHeight: "250px", }, 'Container2');

    $u.r();
}

function genetixBuildExample6() {
    $u.add('GenVContainer', 'MainContainer', {Width:"100%", Height:"100%"}, 'EmptyForm');
    $u.add('GenVContainer', 'Container1', {Width:"100%", Height:"100%"}, 'MainContainer');
    $u.add('GenVContainer', 'VContainer1', {Width:"100%", Height:"50%", MinHeight: "150px"}, 'Container1');
    $u.add('GenVContainer', 'VContainer2', {Width:"100%", Height:"100%", MinHeight: "200px"}, 'VContainer1');
    $u.add('GenVContainer', 'VContainer3',
        {
            Width:"200px", Height:"100%", MinHeight: "250px",
            PadTop: "20px", PadRight: "20px",PadLeft: "20px",PadBottom: "20px",
            HorizontalAlign: "Left", VerticalAlign: "Center",
            Background: "green"
        }, 'VContainer2');
    $u.add('HContainer', 'HContainer1', {Width:"100%", Height:"50%"}, 'Container1');
    $u.add('GenVContainer', 'Container3', {Width:"30%", Height:"100%", Background: "red", PadLeft: "20px"}, 'HContainer1');
    $u.add('GenVContainer', 'Container4', {Width:"30%", Height:"100%", Background: "grey"}, 'HContainer1');
    $u.add('GenVContainer', 'Container7',
        { Width:"100%", Height:"100%",
            PadTop: "5%", PadRight: "5%",PadLeft: "5%",PadBottom: "5%",
            Background: "greenyellow", MinHeight: "200px", MinWidth: "200px"},
        'Container4');
    $u.add('GenVContainer', 'Container5', {Width:"40%", Height:"100%", Background: "yellow"}, 'HContainer1');
    $u.add('GenVContainer', 'Container6', {Width:"100%", Height:"100%", Background: "yellow"}, 'Container5');
    $u.add('GenVContainer', 'Container2', {Width:"100%", Height:"200px", Background: "blue"}, 'Container1');
    $u.add('GenDataGrid', 'GenDataGrid1', {Width:"100%", Height:"100%", MinHeight: "250px", }, 'Container2');

    $u.r();
}

function genetixBuildExample7() {
    $u.add('GenVContainer', 'MainContainer', {Width:"100%", Height:"100%"}, 'EmptyForm');
    genetixCreateDataModel('MainContainer');
    $u.add('GenVContainer', 'VContainer1', {
        Width:"100%",
        Height:"150px",
        MinHeight: "150px",
        Background: "red"
    }, 'Container1');

    var ds = $u.get("DatasetLead");
    var dsGuid = ds.getGuid();
    $u.add('GenDataGrid', 'gridLeads', {
        Width:"100%",
        Height:"auto",
        Scroll: false,
        MinHeight: "250px",
        Dataset: dsGuid
    }, 'MainContainer');
    var columns = [
        {
            "Name": "DataColumnClient",
            "Label": "Client",
            "Field": "client",
            "Width": "18"
        },
        {
                "Name": "DataColumnContact",
                "Label": "Contact",
                "Field": "contact",
                "Width": "20"
        },
        {
                "Name": "DataColumnPhone",
                "Label": "Phone",
                "Field": "phone",
                "Width": "15"
        },
        {
                "Name": "DataColumnEmail",
                "Label": "EMail",
                "Field": "email",
                "Width": "20"
        },
        {
                "Name": "DataColumnProba",
                "Label": "Proba",
                "Field": "proba",
                "Width": "10"
        },
        {
                "Name": "DataColumnAmount",
                "Label": "Amount",
                "Field": "amount"
        }
    ];

    var dsFields = ds.getCol("Fields");
    for (var i = 0; i < columns.length; i++) {
        var col = columns[i];
        var dField = null;
        for (var j = 0; j < dsFields.count(); j++) {
            var fld = dsFields.get(j);
            if (fld.name() == col.Field) {
                dField = fld;
                break;
            }
        }

        col.Field = (dField ? dField.getGuid() : null);
        $u.add('DataColumn', "DataColumn" + i, col, 'gridLeads');
    }

    $u.r();
}


function genetixCreateDataModel(parent) {
    $u.add('ADataModel', 'DataModel', {}, parent);
    genetixCreateLeadsDataSet('DataModel');
}

function genetixCreateLeadsDataSet(parent) {
    $u.add('Dataset', 'DatasetLead', {Root: "c170c217-e519-7c23-2811-ff75cd4bfe81", Active: true}, parent, "Datasets");
    var f = [
        {
            "Name": "Id"
        },
        {
            "Name": "state"
        },
        {
            "Name": "client"
        },
        {
            "Name": "companyId"
        },
        {
            "Name": "contact"
        },
        {
            "Name": "phone"
        },
        {
            "Name": "email"
        },
        {
            "Name": "contactId"
        },
        {
            "Name": "proba"
        },
        {
            "Name": "amount"
        },
        {
            "Name": "user"
        }
    ];
    genetixCreateDatasetFields(parent, f);
}

function genetixCreateDatasetFields(parent, fields) {
    for (var i = 0; i < fields.length; i++) {
        $u.add('DataField', fields[i].Name, {}, parent, "Fields");
    }
}
