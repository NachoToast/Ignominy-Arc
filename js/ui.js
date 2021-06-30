// DateTimeManager handles displaying and incrementation of game date and time
'use strict';

class DateTimeManager {
  static tracking = true;
  static trackingColor = 'rgb(255, 238, 139)';

  static dateOutputElement = document.getElementById('dateTimeOutput');

  static dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  static monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // map for conversion from config letter placeholders to markers
  static dateMap = {
    dddd: 'f00',
    ddd: 'f01',
    dd: 'f02',
    d: 'f03',
    MMMM: 'f10',
    MMM: 'f11',
    MM: 'f12',
    M: 'f13',
    yyyy: 'f20',
    yy: 'f21',
    hh: 'f30',
    h: 'f31',
    mm: 'f40',
    m: 'f41',
    ss: 'f50',
    s: 'f51',
    p: 'f60',
  };

  // adds ordinals ('st', 'nd', 'rd', 'th') to the day number
  static addOrdinals(num) {
    if ([11, 12, 13].indexOf(num) != -1) return 'th'; // 11, 12, 13 edge cases

    switch (num % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  // formats date object in player-specified format
  static formatDate(inputDate = player.time) {
    // get more detailed information about the date object
    const dayNum = inputDate.getDate(),
      dayLong = this.dayNames[inputDate.getDay()],
      monthNum = inputDate.getMonth() + 1,
      monthLong = this.monthNames[monthNum - 1],
      year = inputDate.getFullYear(),
      second = inputDate.getSeconds(),
      minute = inputDate.getMinutes();
    let hour = inputDate.getHours();
    const period = hour >= 12 ? 'pm' : 'am';

    // replace config letter placeholders with markers
    // markers are a necessary intermediate for conversion, since direct conversion, e.g. from MMMM to 'September' causes issues since 'September' has an 'm' in it.
    let formattedDate = IGNOMINY_CONFIG.datetime.format.replace(
      /d+|M+|y+|s+|m+|h+|p/g,
      (char) => this.dateMap[char]
    );

    // 12hr time stuff
    if (!IGNOMINY_CONFIG.datetime.twentyFourHourTime) {
      if (hour > 12) {
        // 12hr time displays hours > 12 as modulus 12, e.g. 13 -> 1pm
        hour -= 12;
      } else if (hour === 0) {
        // 12hr time displays the 0th hour as 12am
        hour = 12;
      }
    }

    // map for conversion from markers to date values
    const dateMap = {
      // day
      f00: dayLong,
      f01: dayLong.substring(0, 3),
      f02: dayNum < 10 ? '0' + dayNum : dayNum,
      f03: dayNum,
      // month
      f10: monthLong,
      f11: monthLong.substring(0, 3),
      f12: monthNum < 10 ? '0' + monthNum : monthNum,
      f13: monthNum,
      // year
      f20: year,
      f21: year.toString().substring(2),
      // hour
      f30: hour < 10 ? '0' + hour : hour,
      f31: hour,
      // minute
      f40: minute < 10 ? '0' + minute : minute,
      f41: minute,
      // second
      f50: second < 10 ? '0' + second : second,
      f51: second,
      // period
      f60: IGNOMINY_CONFIG.datetime.twentyFourHourTime ? '' : period,
    };

    // if ordinals enabled, day number (without leading 0's) should have them
    if (IGNOMINY_CONFIG.datetime.showTimeOrdinals) {
      dateMap.f03 += this.addOrdinals(dayNum);
    }

    // replace markers with actual date values
    formattedDate = formattedDate.replace(
      /f[0-6][0-3]/g,
      (char) => dateMap[char]
    );

    return formattedDate;
  }

  // displays a formatted date to HTML element
  static display() {
    if (this.tracking) {
      console.log(
        `%c[${this.name}]%c Displaying date`,
        `color: ${this.trackingColor}`,
        `color: white`
      );
    }
    this.dateOutputElement.innerHTML = this.formatDate();
  }
}

function update_stats() {
  // visual only

  // name
  stats_name.innerText = player.name;

  // health
  let health_rgb = UIManager.colorGradient(
      0,
      player.max_health,
      player.health,
      std_red,
      std_yellow,
      std_green
    ),
    mana_rgb = UIManager.colorGradient(
      0,
      player.max_mana,
      player.mana,
      std_nomana,
      std_fullmana
    );
  //let tip_top = "144, 238, 144";
  stats_health.innerHTML = `Health: <span style='color: rgb(${health_rgb})'>${
    player.health
  }</span>/${player.max_health} [<span style='color: rgb(${health_rgb})'>${(
    (100 * player.health) /
    player.max_health
  ).toFixed(0)}%</span>]`;

  // mana
  stats_mana.innerHTML = `Mana: <span style='color: rgb(${mana_rgb})'>${
    player.mana
  }</span>/${player.max_mana} [<span style='color: rgb(${mana_rgb})'>${(
    (100 * player.mana) /
    player.max_mana
  ).toFixed(0)}%</span>]`;

  // clear old stats elements [this could probably be optimized]
  let children = stats_container.childElementCount;
  while (children > 2) {
    stats_container.removeChild(stats_container.lastElementChild);
    children -= 1;
  }

  // fatigue
  stats_fatigue.innerHTML =
    `Fatigue <span style='color: rgb(${UIManager.colorGradient(
      0,
      100,
      Math.ceil(player.fatigue),
      { red: 255, green: 255, blue: 255 },
      std_yellow,
      std_red
    )})'>` +
    Math.ceil(player.fatigue) +
    '</span>';
  // gold
  stats_gold.innerHTML = 'Gold ' + player.gold;

  // stats
  for (let i = 0, len = Object.keys(player.stats).length; i < len; i++) {
    // div
    let d = document.createElement('div');
    d.classList.add('stats');
    stats_container.appendChild(d);
    // span
    let s = document.createElement('span');
    s.title = player.stats[Object.keys(player.stats)[i]].description;
    d.appendChild(s);
    // img
    let img = document.createElement('img');
    img.src = `img/ui/${Object.keys(player.stats)[i]}.png`;
    s.appendChild(img);
    // p
    let p = document.createElement('p');
    p.innerHTML =
      Object.keys(player.stats)[i].charAt(0).toUpperCase() +
      Object.keys(player.stats)[i].slice(1) +
      ' ' +
      player.stats[Object.keys(player.stats)[i]].amount;
    s.appendChild(p);
  }
}

// UIManager handles headers, header pages, page resizing, and the trade menu
class UIManager {
  static tracking = true;
  static trackingColor = 'rgb(255, 238, 139)';

  // returns CSS-friendly RGB value as a progression from colorA to colorB (option third color), input color {r: 255, g: 255, b: 255}
  static colorGradient(
    min = 0,
    max = 100,
    current = 50,
    colorA = { r: 0, g: 255, b: 0 },
    colorB = { r: 255, g: 0, b: 0 },
    colorC = undefined
  ) {
    let colorProgression;

    if (min == max) {
      console.warn(
        `%c[${this.name}]%c Color gradient function cannot have identical minimum and maximum values! (min: ${min}, max: ${max})`,
        `color: ${this.trackingColor}`,
        `color: white;`
      );
      return `255, 255, 255`;
    }
    colorProgression = (current - min) / (max - min); // standardize progression to 0-1 (inc)
    colorProgression = Math.max(colorProgression, 0); // lowest progression possible = 0
    colorProgression = Math.min(colorProgression, 1); // highest progression possible = 1

    if (colorC) {
      colorProgression *= 2; // double scale if third colour present
      if (colorProgression >= 1) {
        // if more than halfway set the 'min' color to colorB and the 'max' color to colorC
        colorA = colorB;
        colorB = colorC;
        colorProgression -= 1;
      }
    }

    let redProgress = colorA.red + colorProgression * (colorB.red - colorA.red),
      greenProgress =
        colorA.green + colorProgression * (colorB.green - colorA.green),
      blueProgress =
        colorA.blue + colorProgression * (colorB.blue - colorA.blue);

    return `${parseInt(redProgress)}, ${parseInt(greenProgress)}, ${parseInt(
      blueProgress
    )}`;
  }
}

// HeaderManager handles header page opening and closing
class HeaderManager {
  static currentHeader = null; // currentHeader stores which header is currently open

  // headActions states what each header does when opened
  static headerOpenActions = [
    () => update_stats(), // stats
    () => null, // map
    () => null, // date/time
    () => InventoryManager.open(), // inventory
  ];

  // displays header page (or hides if already open)
  static showHeader(headerNumber = 0) {
    // clicked on already open = close
    if (headerNumber === this.currentHeader) {
      this.currentHeader = null;
      header_pages[headerNumber].classList.add('hidden');
      return;
    }

    // if another page is currently open
    if (this.currentHeader !== null) {
      // hide it
      header_pages[this.currentHeader].classList.add('hidden');
    }

    // do the open function for the new page
    this.headerOpenActions[headerNumber]();
    header_pages[headerNumber].classList.remove('hidden');

    this.currentHeader = headerNumber;
    // header_pages[headerNumber].style.height =
    // document.body.offsetHeight - header.offsetHeight + 'px';
  }

  // unhides all headers specified in player config
  static unhideAllHeaders() {
    for (let i = 0, len = header_options.length; i < len; i++) {
      header_options[i].classList.remove('hidden');
    }
  }
}

// TradeMenu controls hiding/showing of trade menu, keydown listening, and generation of new trades
class TradeMenu {
  static tracking = true;
  static trackingColor = 'rgb(255, 238, 139)';

  static menuElement = document.getElementById('trade');
  static isOpen = false;

  // keydown listener
  static checkMenuClose = (e) => {
    if (e.key === 'x') {
      this.toggle();
    }
  };

  static toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  static open() {
    this.isOpen = true;
    if (this.tracking) {
      console.log(
        `%c[${this.name}]%c Opening trade menu`,
        `color: ${this.trackingColor}`,
        `color: white`
      );
    }

    this.menuElement.style.display = 'flex';
    game_window.style.display = 'none';
    document.addEventListener('keydown', this.checkMenuClose);
    doing_trade = true;
  }

  static close() {
    this.isOpen = false;
    if (this.tracking) {
      console.log(
        `%c[${this.name}]%c Closing trade menu`,
        `color: ${this.trackingColor}`,
        `color: white`
      );
    }

    this.menuElement.style.display = 'none';
    game_window.style.display = 'flex';
    document.removeEventListener('keydown', this.checkMenuClose);
    doing_trade = false;
  }
}

// InventoryManager handles UI related activities in player inventory
class InventoryManager {
  // open the inventory
  static open() {
    let uniqueCount = player.inventory.length,
      fullCount = 0,
      invItems = [];

    inventory_container.innerHTML = '';

    if (uniqueCount != 0) {
      for (let i = 0, len = uniqueCount; i < len; i++) {
        // find item in global items array
        let itemIndex = item_map.indexOf(player.inventory[i].name);
        if (itemIndex == -1) {
          console.warn(
            `Couldn't find item ${i + 1} - ${
              player.inventory[i].name
            } from inventory in global items list.`,
            player.inventory[i]
          );
          continue;
        }

        let item = items[itemIndex],
          itemElement = this.generateItemCard(item, i);
        inventory_container.appendChild(itemElement);
        invItems.push(itemElement);
        fullCount += player.inventory[i].count;
      }
    }

    inventory_title.innerHTML = `${player.name}'s Inventory (<span title='Unique Item Count' class='hover_gray'>${uniqueCount}</span> <span title='Total Item Count' class='hover_gray'>[${fullCount}]</span>)`;
  }

  // generates a 'card' with item name, description, image, count, and other metadata
  static generateItemCard(item, index = 0) {
    // main div
    let itemCard = document.createElement('div');
    itemCard.classList.add('inv_item');

    // image
    let img = document.createElement('img');
    img.src = `img/item/${item.src}`;
    itemCard.appendChild(img);

    // metadata div
    let infoDiv = document.createElement('div');

    // name + count
    let h1 = document.createElement('h1');
    let count = player.inventory[index].count;
    h1.innerHTML = `${item.name} (${count})`;
    infoDiv.appendChild(h1);

    // description
    let desc = document.createElement('p');
    desc.innerHTML = item.desc;
    infoDiv.appendChild(desc);

    // [use] options
    let useDiv = document.createElement('div');
    {
      // item use buttons, currently unused
      /*       if (item?.user !== undefined) {
        infoDiv.appendChild(
          this.itemFuncElements(
            'Use',
            player.inventory[index].count,
            'iu',
            index,
            (a, b) => inventory_use(a, b)
          )
        );
      } */
    }
    infoDiv.appendChild(useDiv);

    // [discard] options
    infoDiv.appendChild(
      this.itemFuncElements(
        'Discard',
        player.inventory[index].count,
        'id',
        index,
        (a, b) => inventory_discard(a, b)
      )
    );

    itemCard.appendChild(infoDiv);

    return itemCard;
  }

  // helper for generateItemCards, to create the discard/use X elements
  static itemFuncElements(
    type = 'Discard', // label to give action in inventory, e.g. 'Discard' or 'Use'
    amount = 1, // amount of item the player has
    cssClass = '', // if buttons have special hover styling, etc
    index = 0, // index of item in global items array
    action = (a, b) => inventory_discard(a, b) // what clicking the button actually does
  ) {
    let infoDiv = document.createElement('div');
    infoDiv.innerHTML = `${type}: `;

    let numbersToGenerate = [1];
    if (amount >= 50) {
      numbersToGenerate.push(10);
    } else if (amount >= 10) {
      numbersToGenerate.push(5);
    }

    // loop
    for (let i = 0, len = numbersToGenerate.length; i < len; i++) {
      let varAmount = document.createElement('p');
      varAmount.classList.add(cssClass);
      varAmount.innerHTML = numbersToGenerate[i];
      varAmount.onclick = () => action(index, numbersToGenerate[i]);
      infoDiv.appendChild(varAmount);
    }

    // all
    if (amount > 1) {
      let all = document.createElement('p');
      all.classList.add(cssClass);
      all.innerHTML = 'All';
      all.onclick = () => action(index, amount);
      infoDiv.appendChild(all);
    }

    return infoDiv;
  }
}

class MetaManager {
  static tracking = true;
  static trackingColor = 'rgb(255, 238, 139)';

  static metaElement = document.getElementById('meta');
  static currentMeta = {
    authors: ['NachoToast'],
    version: '0.1.14',
    legacy_version: '0.0.1',
  };

  static update(inputMeta) {
    // overwrite stored meta with input if it exists and is different
    if (inputMeta !== undefined && inputMeta !== this.currentMeta) {
      this.currentMeta = inputMeta;
    }

    // if no meta is supposed to be shown
    if (
      !IGNOMINY_CONFIG.scenes.showAuthors &&
      !IGNOMINY_CONFIG.scenes.showVersion
    ) {
      // if meta is currently being shown
      if (this.metaElement.style.display !== 'none') {
        if (this.tracking) {
          console.log(
            `%c[${this.name}]%c Hiding meta`,
            `color: ${this.trackingColor}`,
            `color: white`
          );
        }
        this.metaElement.style.display = 'none';
      }
      return;
    }

    if (this.tracking) {
      console.log(
        `%c[${this.name}]%c Updating meta`,
        `color: ${this.trackingColor}`,
        `color: white`
      );
    }

    // show element
    this.metaElement.style.display = 'block';

    // update element
    if (IGNOMINY_CONFIG.scenes.showAuthors) {
      let authorsList = 'Author';

      if (this.currentMeta.authors === undefined) {
        // no authors
        authorsList += `: <span>Unknown</span>.`;
      } else {
        const numAuthors = this.currentMeta.authors.length;

        if (numAuthors == 1) {
          // 1 author
          authorsList += `: <span>${this.currentMeta.authors[0]}</span>.`;
        } else {
          // multiple authors should be separated by commas
          authorsList += `s (${numAuthors}): <span>${this.currentMeta.authors[0]}</span>`;
          for (let i = 1, len = this.currentMeta.authors.length; i < len; i++) {
            authorsList += `, <span> ${this.currentMeta.authors[i]}</span>`;
          }
          authorsList += `.`;
        }
      }

      this.metaElement.children[0].style.display = 'block';
      this.metaElement.children[0].innerHTML = authorsList;
    } else {
      this.metaElement.children[0].style.display = 'none';
    }

    if (IGNOMINY_CONFIG.scenes.showVersion) {
      this.metaElement.children[1].style.display = 'block';

      this.metaElement.children[1].innerHTML = `Added: <span>${
        this.currentMeta.version ?? 'Unknown'
      }</span>`;

      // legacy version
      if (
        IGNOMINY_CONFIG.scenes.showVersionLegacy &&
        this.currentMeta.legacy_version !== undefined
      ) {
        this.metaElement.children[1].innerHTML += ` [<span>${this.currentMeta.legacy_version}</span>]`;
      }
    } else {
      this.metaElement.children[1].style.display = 'none';
    }
  }
}
