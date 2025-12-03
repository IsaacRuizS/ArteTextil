import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-basic',
	templateUrl: './basic.component.html',
	styleUrls: ['./basic.component.css']
})
export class BasicComponent {
	// For Custom file upload 

	@ViewChild('labelImport', { static: true })
	labelImport: ElementRef;

	formImport: FormGroup;
	fileToUpload: File = null;

	constructor() {
		this.formImport = new FormGroup({
			importFile: new FormControl('', Validators.required)
		});
	}

	onFileChange(files: FileList) {
		this.labelImport.nativeElement.innerText = Array.from(files)
			.map(f => f.name)
			.join(', ');
		this.fileToUpload = files.item(0);
	}

	import(): void {
		console.log('import ' + this.fileToUpload.name);
	}
}
