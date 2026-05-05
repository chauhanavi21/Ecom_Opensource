import { Component, inject } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";
import { AuthService } from "../auth.service";

@Component({
  selector: "app-shell",
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: "./shell.component.html",
  styleUrl: "./shell.component.css",
})
export class ShellComponent {
  readonly auth = inject(AuthService);
}
