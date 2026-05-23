import React, { useState } from "react";

function App() {
  var h = React.createElement;

  var correctPassword = "micro987";
  var maxAttempts = 3;
  var lockTime = 30 * 60 * 1000;

  var savedLockUntil = Number(localStorage.getItem("lockUntil") || "0");
  var savedLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  var loginState = useState(savedLoggedIn && Date.now() >= savedLockUntil);
  var isLoggedIn = loginState[0];
  var setIsLoggedIn = loginState[1];

  var passwordState = useState("");
  var password = passwordState[0];
  var setPassword = passwordState[1];

  var attemptsState = useState(Number(localStorage.getItem("wrongAttempts") || "0"));
  var wrongAttempts = attemptsState[0];
  var setWrongAttempts = attemptsState[1];

  var lockState = useState(savedLockUntil);
  var lockUntil = lockState[0];
  var setLockUntil = lockState[1];

  var categoryState = useState("");
  var category = categoryState[0];
  var setCategory = categoryState[1];

  var stationState = useState("");
  var station = stationState[0];
  var setStation = stationState[1];

  var optionState = useState("");
  var option = optionState[0];
  var setOption = optionState[1];

  var searchState = useState("");
  var search = searchState[0];
  var setSearch = searchState[1];

  var noteState = useState("");
  var note = noteState[0];
  var setNote = noteState[1];

  var photosState = useState([]);
  var photos = photosState[0];
  var setPhotos = photosState[1];

  var openedPhotoState = useState(null);
  var openedPhoto = openedPhotoState[0];
  var setOpenedPhoto = openedPhotoState[1];

  var selectionModeState = useState(false);
  var selectionMode = selectionModeState[0];
  var setSelectionMode = selectionModeState[1];

  var selectedPhotosState = useState([]);
  var selectedPhotos = selectedPhotosState[0];
  var setSelectedPhotos = selectedPhotosState[1];

  var categories = ["Sediment", "Copepod", "Water"];

  var stations = Array.from({ length: 55 }, function (_, index) {
    return index + 1;
  });

  var filteredStations = stations.filter(function (num) {
    if (search === "") {
      return true;
    }

    return num === Number(search);
  });

  var noteKey = "note_" + category + "_" + station;
  var photoKey = "photos_" + category + "_" + station;

  function getLockMinutesLeft() {
    var remaining = lockUntil - Date.now();

    if (remaining <= 0) {
      return 0;
    }

    return Math.ceil(remaining / 60000);
  }

  function handleLogin() {
    if (lockUntil > Date.now()) {
      alert("Website is locked. Try again after " + getLockMinutesLeft() + " minutes.");
      return;
    }

    if (password === correctPassword) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("wrongAttempts", "0");
      localStorage.removeItem("lockUntil");

      setIsLoggedIn(true);
      setWrongAttempts(0);
      setLockUntil(0);
      setPassword("");
      return;
    }

    var newAttempts = wrongAttempts + 1;

    if (newAttempts >= maxAttempts) {
      var newLockUntil = Date.now() + lockTime;

      localStorage.setItem("wrongAttempts", String(newAttempts));
      localStorage.setItem("lockUntil", String(newLockUntil));
      localStorage.setItem("isLoggedIn", "false");

      setWrongAttempts(newAttempts);
      setLockUntil(newLockUntil);
      setPassword("");

      alert("Wrong password 3 times. Locked for 30 minutes.");
      return;
    }

    localStorage.setItem("wrongAttempts", String(newAttempts));
    setWrongAttempts(newAttempts);
    setPassword("");

    alert("Wrong password. Attempts left: " + (maxAttempts - newAttempts));
  }

  function handleLogout() {
    localStorage.setItem("isLoggedIn", "false");
    setIsLoggedIn(false);
  }

  function normalizePhotos(savedData) {
    try {
      var parsedPhotos = JSON.parse(savedData);

      if (!Array.isArray(parsedPhotos)) {
        return [];
      }

      return parsedPhotos.map(function (photo, index) {
        if (typeof photo === "string") {
          return {
            name: "Photo " + (index + 1),
            date: "Saved earlier",
            data: photo
          };
        }

        return {
          name: photo.name || "Photo " + (index + 1),
          date: photo.date || "Unknown date",
          data: photo.data || ""
        };
      });
    } catch (error) {
      return [];
    }
  }

  function goHome() {
    setCategory("");
    setStation("");
    setOption("");
    setSearch("");
    setNote("");
    setPhotos([]);
    setOpenedPhoto(null);
    setSelectionMode(false);
    setSelectedPhotos([]);
  }

  function goStations() {
    setStation("");
    setOption("");
    setSearch("");
    setNote("");
    setPhotos([]);
    setOpenedPhoto(null);
    setSelectionMode(false);
    setSelectedPhotos([]);
  }

  function goOptions() {
    setOption("");
    setNote("");
    setPhotos([]);
    setOpenedPhoto(null);
    setSelectionMode(false);
    setSelectedPhotos([]);
  }

  function openNote() {
    var savedNote = localStorage.getItem(noteKey);
    setNote(savedNote || "");
    setOption("note");
  }

  function saveNote() {
    localStorage.setItem(noteKey, note);
    alert("Note saved!");
  }

  function openPhoto() {
    var savedPhotos = localStorage.getItem(photoKey);

    if (savedPhotos) {
      setPhotos(normalizePhotos(savedPhotos));
    } else {
      setPhotos([]);
    }

    setOpenedPhoto(null);
    setSelectionMode(false);
    setSelectedPhotos([]);
    setOption("photo");
  }

  function handlePhotos(event) {
    var files = Array.from(event.target.files);

    if (files.length === 0) {
      return;
    }

    var invalidFile = files.find(function (file) {
      return file.type !== "image/jpeg" && file.type !== "image/png";
    });

    if (invalidFile) {
      alert("Only JPG, JPEG, or PNG files are allowed.");
      event.target.value = "";
      return;
    }

    files.forEach(function (file) {
      var reader = new FileReader();

      reader.onload = function () {
        var newPhoto = {
          name: file.name,
          date: new Date().toLocaleString(),
          data: reader.result
        };

        setPhotos(function (oldPhotos) {
          return oldPhotos.concat(newPhoto);
        });
      };

      reader.readAsDataURL(file);
    });

    event.target.value = "";
  }

  function savePhotos() {
    if (photos.length === 0) {
      alert("Please select at least one photo first.");
      return;
    }

    localStorage.setItem(photoKey, JSON.stringify(photos));
    alert("Photos saved!");
  }

  function deletePhoto(indexToDelete) {
    var updatedPhotos = photos.filter(function (_, index) {
      return index !== indexToDelete;
    });

    var updatedSelectedPhotos = selectedPhotos
      .filter(function (index) {
        return index !== indexToDelete;
      })
      .map(function (index) {
        if (index > indexToDelete) {
          return index - 1;
        }

        return index;
      });

    setPhotos(updatedPhotos);
    setSelectedPhotos(updatedSelectedPhotos);
    localStorage.setItem(photoKey, JSON.stringify(updatedPhotos));

    if (openedPhoto !== null && openedPhoto.index === indexToDelete) {
      setOpenedPhoto(null);
    }
  }

  function deleteAllPhotos() {
    localStorage.removeItem(photoKey);
    setPhotos([]);
    setOpenedPhoto(null);
    setSelectionMode(false);
    setSelectedPhotos([]);
    alert("All photos deleted!");
  }

  function toggleSelectionMode() {
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedPhotos([]);
    } else {
      setSelectionMode(true);
    }
  }

  function togglePhotoSelect(indexToToggle) {
    if (!selectionMode) {
      return;
    }

    if (selectedPhotos.indexOf(indexToToggle) >= 0) {
      setSelectedPhotos(
        selectedPhotos.filter(function (index) {
          return index !== indexToToggle;
        })
      );
    } else {
      setSelectedPhotos(selectedPhotos.concat(indexToToggle));
    }
  }

  function selectAllPhotos() {
    var allIndexes = photos.map(function (_, index) {
      return index;
    });

    setSelectionMode(true);
    setSelectedPhotos(allIndexes);
  }

  function clearSelectedPhotos() {
    setSelectedPhotos([]);
  }

  function safeFileName(name, fallbackName) {
    var fileName = name || fallbackName || "photo.png";
    return fileName.replace(/[\\/:*?"<>|]/g, "_");
  }

  function downloadPhoto(photo) {
    var link = document.createElement("a");
    link.href = photo.data;
    link.download = safeFileName(photo.name, "photo.png");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadSelectedPhotos() {
    if (selectedPhotos.length === 0) {
      alert("Select at least one photo first.");
      return;
    }

    selectedPhotos.forEach(function (photoIndex, index) {
      setTimeout(function () {
        downloadPhoto(photos[photoIndex]);
      }, index * 300);
    });
  }

  function downloadAllPhotos() {
    if (photos.length === 0) {
      alert("No photos to download.");
      return;
    }

    photos.forEach(function (photo, index) {
      setTimeout(function () {
        downloadPhoto(photo);
      }, index * 300);
    });
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function copySelectedPhotos() {
    if (selectedPhotos.length === 0) {
      alert("Select at least one photo first.");
      return;
    }

    if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
      alert("Clipboard image/html copy is not supported. Use Download Selected.");
      return;
    }

    try {
      var selectedPhotoObjects = selectedPhotos.map(function (index) {
        return photos[index];
      });

      var htmlContent = '<div style="display:block;">';

      selectedPhotoObjects.forEach(function (photo) {
        htmlContent =
          htmlContent +
          '<div style="margin-bottom:18px;">' +
          '<img src="' +
          photo.data +
          '" alt="' +
          escapeHtml(photo.name) +
          '" style="max-width:100%; height:auto; display:block;" />' +
          "</div>";
      });

      htmlContent = htmlContent + "</div>";

      var plainText = selectedPhotoObjects
        .map(function (photo) {
          return photo.name;
        })
        .join("\n");

      var htmlBlob = new Blob([htmlContent], { type: "text/html" });
      var textBlob = new Blob([plainText], { type: "text/plain" });

      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob
        })
      ]);

      alert("Selected photos copied. Paste into Word / Google Docs / Gmail.");
    } catch (error) {
      alert("Copy failed. Use Download Selected instead.");
    }
  }

  function exportBackup() {
    var backup = {
      app: "microplastics-research",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {}
    };

    for (var i = 0; i < localStorage.length; i = i + 1) {
      var key = localStorage.key(i);

      if (key) {
        if (key.indexOf("note_") === 0 || key.indexOf("photos_") === 0) {
          backup.data[key] = localStorage.getItem(key);
        }
      }
    }

    var jsonText = JSON.stringify(backup, null, 2);
    var blob = new Blob([jsonText], { type: "application/json" });
    var url = URL.createObjectURL(blob);

    var link = document.createElement("a");
    link.href = url;
    link.download =
      "microplastic-backup-" + new Date().toISOString().slice(0, 10) + ".json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function importBackup(event) {
    var file = event.target.files[0];

    if (!file) {
      return;
    }

    var reader = new FileReader();

    reader.onload = function () {
      try {
        var backup = JSON.parse(reader.result);

        if (!backup.data || typeof backup.data !== "object") {
          alert("Invalid backup file.");
          event.target.value = "";
          return;
        }

        Object.keys(backup.data).forEach(function (key) {
          if (key.indexOf("note_") === 0 || key.indexOf("photos_") === 0) {
            localStorage.setItem(key, backup.data[key]);
          }
        });

        goHome();
        alert("Backup imported successfully.");
      } catch (error) {
        alert("Import failed. Invalid JSON file.");
      }

      event.target.value = "";
    };

    reader.readAsText(file);
  }

  function renderBackupButtons() {
    return h(
      "div",
      { className: "row photo-toolbar" },
      h("button", { onClick: exportBackup }, "Export Backup"),
      h(
        "button",
        {
          onClick: function () {
            var input = document.getElementById("backup-import-input");
            if (input) {
              input.click();
            }
          }
        },
        "Import Backup"
      ),
      h("input", {
        id: "backup-import-input",
        type: "file",
        accept: ".json,application/json",
        style: { display: "none" },
        onChange: importBackup
      })
    );
  }

  if (!isLoggedIn) {
    return h(
      "div",
      { className: "page home" },
      h("h1", null, "Microplastics Research"),
      h(
        "div",
        { className: "box" },
        h("h2", null, "Enter Password"),
        h("input", {
          type: "password",
          placeholder: "Password",
          value: password,
          onChange: function (event) {
            setPassword(event.target.value);
          },
          onKeyDown: function (event) {
            if (event.key === "Enter") {
              handleLogin();
            }
          }
        }),
        h("div", { style: { height: "15px" } }),
        h("button", { onClick: handleLogin }, "Enter"),
        lockUntil > Date.now()
          ? h(
              "p",
              { className: "selected-count" },
              "Locked. Try again after " + getLockMinutesLeft() + " minutes."
            )
          : h(
              "p",
              { className: "selected-count" },
              "Wrong attempts: " + wrongAttempts + " / " + maxAttempts
            )
      )
    );
  }

  if (category !== "") {
    if (station !== "") {
      if (option === "photo") {
        return h(
          "div",
          { className: "page" },
          h(
            "div",
            { className: "menu" },
            h("button", { onClick: goOptions }, "← Back to Options"),
            h("button", { onClick: handleLogout }, "Logout")
          ),
          h(
            "h1",
            null,
            "Photos - " +
              category +
              " Station " +
              String(station).padStart(2, "0")
          ),
          h(
            "div",
            { className: "box" },
            h(
              "label",
              { className: "upload" },
              "Upload Photos",
              h("input", {
                type: "file",
                accept: ".jpg,.jpeg,.png",
                multiple: true,
                onChange: handlePhotos
              })
            ),
            photos.length > 0
              ? h(
                  React.Fragment,
                  null,
                  h(
                    "div",
                    { className: "row photo-toolbar" },
                    h(
                      "button",
                      { onClick: toggleSelectionMode },
                      selectionMode ? "Cancel Select" : "Select Photos"
                    ),
                    h("button", { onClick: selectAllPhotos }, "Select All"),
                    h("button", { onClick: clearSelectedPhotos }, "Clear"),
                    h("button", { onClick: copySelectedPhotos }, "Copy Selected"),
                    h(
                      "button",
                      { onClick: downloadSelectedPhotos },
                      "Download Selected"
                    ),
                    h("button", { onClick: downloadAllPhotos }, "Download All"),
                    h("button", { onClick: savePhotos }, "Save Photos"),
                    h(
                      "button",
                      { className: "danger", onClick: deleteAllPhotos },
                      "Delete All"
                    )
                  ),
                  h(
                    "p",
                    { className: "selected-count" },
                    "Total Photos: " +
                      photos.length +
                      " | Selected: " +
                      selectedPhotos.length
                  ),
                  h(
                    "div",
                    { className: "file-list" },
                    h(
                      "div",
                      { className: "file-list-header" },
                      h("div", null, "Name"),
                      h("div", null, "Date accessed"),
                      h("div", null, "Action")
                    ),
                    photos.map(function (photo, index) {
                      var isSelected = selectedPhotos.indexOf(index) >= 0;

                      return h(
                        "div",
                        {
                          className: isSelected
                            ? "file-row selected-row"
                            : "file-row",
                          key: index
                        },
                        h(
                          "div",
                          {
                            className: "file-name-area",
                            onClick: function () {
                              if (selectionMode) {
                                togglePhotoSelect(index);
                              } else {
                                setOpenedPhoto({
                                  name: photo.name,
                                  date: photo.date,
                                  data: photo.data,
                                  index: index
                                });
                              }
                            }
                          },
                          h(
                            "div",
                            { className: "thumbnail-wrap" },
                            h("img", {
                              src: photo.data,
                              alt: photo.name,
                              className: "file-thumbnail"
                            }),
                            selectionMode
                              ? h(
                                  "button",
                                  {
                                    className: isSelected
                                      ? "select-circle selected-circle"
                                      : "select-circle",
                                    onClick: function (event) {
                                      event.stopPropagation();
                                      togglePhotoSelect(index);
                                    }
                                  },
                                  isSelected ? "✓" : ""
                                )
                              : null
                          ),
                          h(
                            "div",
                            { className: "file-text" },
                            h("strong", null, photo.name),
                            h(
                              "span",
                              null,
                              category +
                                " / Station " +
                                String(station).padStart(2, "0")
                            )
                          )
                        ),
                        h("div", { className: "file-date" }, photo.date),
                        h(
                          "div",
                          { className: "file-actions" },
                          h(
                            "button",
                            {
                              onClick: function () {
                                setOpenedPhoto({
                                  name: photo.name,
                                  date: photo.date,
                                  data: photo.data,
                                  index: index
                                });
                              }
                            },
                            "Open"
                          ),
                          h(
                            "button",
                            {
                              onClick: function () {
                                downloadPhoto(photo);
                              }
                            },
                            "Download"
                          ),
                          h(
                            "button",
                            {
                              className: "danger",
                              onClick: function () {
                                deletePhoto(index);
                              }
                            },
                            "Delete"
                          )
                        )
                      );
                    })
                  )
                )
              : null
          ),
          openedPhoto !== null
            ? h(
                "div",
                { className: "modal" },
                h(
                  "div",
                  { className: "modal-content" },
                  h(
                    "button",
                    {
                      className: "modal-close",
                      onClick: function () {
                        setOpenedPhoto(null);
                      }
                    },
                    "Close"
                  ),
                  h("h2", { className: "modal-title" }, openedPhoto.name),
                  h("img", {
                    src: openedPhoto.data,
                    alt: openedPhoto.name,
                    className: "modal-img"
                  })
                )
              )
            : null
        );
      }

      if (option === "note") {
        return h(
          "div",
          { className: "page" },
          h(
            "div",
            { className: "menu" },
            h("button", { onClick: goOptions }, "← Back to Options"),
            h("button", { onClick: handleLogout }, "Logout")
          ),
          h(
            "h1",
            null,
            "Microplastics - " +
              category +
              " Station " +
              String(station).padStart(2, "0")
          ),
          h(
            "div",
            { className: "box" },
            h("textarea", {
              placeholder: "Write microplastics notes here...",
              value: note,
              onChange: function (event) {
                setNote(event.target.value);
              }
            }),
            h("button", { onClick: saveNote }, "Save Note")
          )
        );
      }

      return h(
        "div",
        { className: "page" },
        h(
          "div",
          { className: "menu" },
          h("button", { onClick: goStations }, "← Back to Stations"),
          h("button", { onClick: handleLogout }, "Logout")
        ),
        h(
          "h1",
          null,
          category + " - Station " + String(station).padStart(2, "0")
        ),
        h(
          "div",
          { className: "cards" },
          h(
            "div",
            { className: "card", onClick: openPhoto },
            h("h2", null, "Add Photo"),
            h("p", null, "Upload, select, copy, download and open photos.")
          ),
          h(
            "div",
            { className: "card", onClick: openNote },
            h("h2", null, "Microplastics"),
            h("p", null, "Write or edit notes.")
          )
        )
      );
    }

    return h(
      "div",
      { className: "page" },
      h(
        "div",
        { className: "menu" },
        h("button", { onClick: goHome }, "← Back"),
        h("input", {
          type: "number",
          min: "1",
          max: "55",
          placeholder: "Search station number...",
          value: search,
          onChange: function (event) {
            setSearch(event.target.value);
          }
        }),
        h("button", { onClick: handleLogout }, "Logout")
      ),
      h("h1", null, category + " Stations"),
      h(
        "div",
        { className: "station-list" },
        filteredStations.map(function (num) {
          return h(
            "div",
            {
              className: "station",
              key: num,
              onClick: function () {
                setStation(num);
              }
            },
            "Station " + String(num).padStart(2, "0")
          );
        })
      )
    );
  }

  return h(
    "div",
    { className: "page home" },
    h("h1", null, "Microplastics Research"),
    h(
      "div",
      { className: "cards" },
      categories.map(function (item) {
        return h(
          "div",
          {
            className: "card main",
            key: item,
            onClick: function () {
              setCategory(item);
            }
          },
          item
        );
      })
    ),
    renderBackupButtons(),
    h("button", { onClick: handleLogout }, "Logout")
  );
}

export default App;